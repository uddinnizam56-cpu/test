import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import {
  DriveFileItem,
  WORKSPACE_SCOPES,
  GoogleFormTemplateType,
  GoogleFormSummary,
  GoogleFormQuestion,
  GoogleFormResponseItem,
} from '../types';

export { auth };

// Configure Google Provider with the requested Google Workspace scopes (Drive + Sheets)
export const googleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Prompt for consent to ensure refresh token / all scopes are granted
googleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline',
});

// In-Memory Token Cache (MANDATORY: Never store in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleWorkspace = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google OAuth.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getWorkspaceAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogleWorkspace = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/* =========================================================================
   Google Sheets API Client (Client-Side REST with Bearer Token)
   ========================================================================= */

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  folderWebViewLink?: string;
}

export interface SheetTabInput {
  sheetTitle: string;
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Creates a new Google Spreadsheet in the user's Google Drive with specified sheets, headers, and rows,
 * populates all tabs atomically via values:batchUpdate, and links it into PunarChakra-Backups folder.
 */
export const createGoogleSpreadsheet = async (
  title: string,
  sheetsData: SheetTabInput[]
): Promise<CreateSheetResponse> => {
  const token = getWorkspaceAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to access Google Sheets.');
  }

  // 1. Create Spreadsheet container with all tabs
  const createPayload = {
    properties: {
      title,
    },
    sheets: sheetsData.map((s) => ({
      properties: {
        title: s.sheetTitle,
        gridProperties: {
          rowCount: Math.max(s.rows.length + 10, 25),
          columnCount: Math.max(s.headers.length + 2, 12),
          frozenRowCount: 1,
        },
      },
    })),
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Sheets create failed: ${errText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl =
    createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values across all tabs in a single batchUpdate call
  const dataRanges = sheetsData.map((s) => ({
    range: `'${s.sheetTitle.replace(/'/g, "''")}'!A1`,
    majorDimension: 'ROWS',
    values: [s.headers, ...s.rows],
  }));

  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataRanges,
      }),
    }
  );

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Google Sheets batch populate failed: ${errText}`);
  }

  // 3. Organize spreadsheet inside PunarChakra-Backups folder in Google Drive (best-effort)
  let folderWebViewLink: string | undefined;
  try {
    const folder = await getOrCreateDriveFolder('PunarChakra-Backups');
    folderWebViewLink = folder.webViewLink;
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${encodeURIComponent(
        folder.id
      )}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    // Non-fatal: spreadsheet remains accessible in Google Drive root
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    folderWebViewLink,
  };
};

/**
 * Updates an existing Google Spreadsheet with all specified tabs and rows.
 * (MANDATORY: Requires explicit user confirmation before overwriting spreadsheet data)
 */
export const syncAllSheetsToExistingSpreadsheet = async (
  spreadsheetId: string,
  sheetsData: SheetTabInput[],
  onConfirmCallback: () => boolean | Promise<boolean>
): Promise<CreateSheetResponse> => {
  const confirmed = await onConfirmCallback();
  if (!confirmed) {
    throw new Error('Spreadsheet update cancelled by user.');
  }

  const token = getWorkspaceAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to update Google Sheets.');
  }

  // 1. Inspect existing sheet tabs
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,spreadsheetUrl,sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!metaRes.ok) {
    const errText = await metaRes.text();
    throw new Error(`Failed to inspect existing spreadsheet: ${errText}`);
  }

  const metaData = await metaRes.json();
  const existingTitles = new Set<string>(
    (metaData.sheets || []).map((s: any) => s.properties?.title).filter(Boolean)
  );

  // 2. Create any missing tabs first
  const missingTabs = sheetsData.filter((s) => !existingTitles.has(s.sheetTitle));
  if (missingTabs.length > 0) {
    const addRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: missingTabs.map((s) => ({
            addSheet: {
              properties: {
                title: s.sheetTitle,
                gridProperties: {
                  rowCount: Math.max(s.rows.length + 10, 25),
                  columnCount: Math.max(s.headers.length + 2, 12),
                  frozenRowCount: 1,
                },
              },
            },
          })),
        }),
      }
    );
    if (!addRes.ok) {
      const errText = await addRes.text();
      throw new Error(`Failed to add missing tabs: ${errText}`);
    }
  }

  // 3. Batch clear target ranges before writing fresh dataset
  const clearRanges = sheetsData.map(
    (s) => `'${s.sheetTitle.replace(/'/g, "''")}'!A1:Z5000`
  );
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ranges: clearRanges }),
    }
  );

  // 4. Write all tab headers + rows via values:batchUpdate
  const batchRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: sheetsData.map((s) => ({
          range: `'${s.sheetTitle.replace(/'/g, "''")}'!A1`,
          majorDimension: 'ROWS',
          values: [s.headers, ...s.rows],
        })),
      }),
    }
  );

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Failed to update spreadsheet values: ${errText}`);
  }

  return {
    spreadsheetId,
    spreadsheetUrl:
      metaData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title: metaData.properties?.title || 'PunarChakra Master Spreadsheet',
  };
};

/**
 * Reads values from a specified Google Spreadsheet tab/range
 */
export const readGoogleSpreadsheetValues = async (
  spreadsheetId: string,
  range: string
): Promise<(string | number)[][]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to read spreadsheet data.');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read spreadsheet values: ${errText}`);
  }

  const data = await res.json();
  return data.values || [];
};

/**
 * Appends rows to a Google Spreadsheet tab
 */
export const appendToGoogleSpreadsheet = async (
  spreadsheetId: string,
  sheetTitle: string,
  rows: (string | number)[][]
): Promise<void> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to append data.');

  const range = `${encodeURIComponent(sheetTitle)}!A:A`;
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append to spreadsheet: ${errText}`);
  }
};

/* =========================================================================
   Google Drive API Client (Files, Spreadsheets Browser, Uploads)
   ========================================================================= */

/**
 * Searches and lists Google Spreadsheets accessible by the user in Google Drive
 */
export const listGoogleSpreadsheetsFromDrive = async (): Promise<DriveFileItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to list spreadsheets.');

  const query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,modifiedTime,size)&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to query Google Drive for spreadsheets: ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Lists recent files in user's Google Drive
 */
export const listAllDriveFiles = async (): Promise<DriveFileItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to access Drive files.');

  const url = `https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id,name,mimeType,webViewLink,modifiedTime,size)&pageSize=30&orderBy=modifiedTime desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list files from Google Drive: ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
};

/**
 * Uploads a text/CSV or JSON file directly into the user's Google Drive
 */
export const uploadFileToDrive = async (
  fileName: string,
  mimeType: string,
  content: string
): Promise<DriveFileItem> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to upload to Drive.');

  const metadata = {
    name: fileName,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive upload failed: ${errText}`);
  }

  return await res.json();
};

/**
 * Deletes a file from Google Drive.
 * (MANDATORY: Requires explicit user confirmation)
 */
export const deleteFileFromDrive = async (
  fileId: string,
  fileName: string,
  onConfirmCallback: () => boolean | Promise<boolean>
): Promise<void> => {
  const confirmed = await onConfirmCallback();
  if (!confirmed) {
    return;
  }

  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to perform this action.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Failed to delete file from Google Drive: ${errText}`);
  }
};

export interface BackupUploadResult {
  fileId: string;
  fileName: string;
  fileWebViewLink?: string;
  folderId: string;
  folderName: string;
  folderWebViewLink?: string;
}

/**
 * Finds or creates a specific folder in Google Drive (e.g. 'PunarChakra-Backups')
 */
export const getOrCreateDriveFolder = async (
  folderName: string = 'PunarChakra-Backups'
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to access Google Drive.');

  // 1. Search if folder already exists
  const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,webViewLink)&pageSize=1`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
  }

  // 2. Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Shared backup directory for PunarChakra user and order records',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create '${folderName}' folder in Google Drive: ${errText}`);
  }

  const folderData = await createRes.json();
  return {
    id: folderData.id,
    name: folderName,
    webViewLink: folderData.webViewLink || `https://drive.google.com/drive/folders/${folderData.id}`,
  };
};

/**
 * Uploads any backup file (CSV or JSON) directly into the shared 'PunarChakra-Backups' folder in Google Drive
 */
export const uploadBackupFileToDriveFolder = async (
  fileName: string,
  mimeType: string,
  content: string,
  description: string = 'PunarChakra complete administrative backup'
): Promise<BackupUploadResult> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to upload backups.');

  const folder = await getOrCreateDriveFolder('PunarChakra-Backups');

  const metadata = {
    name: fileName,
    mimeType,
    parents: [folder.id],
    description,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload backup to '${folder.name}': ${errText}`);
  }

  const uploadedFile = await res.json();
  return {
    fileId: uploadedFile.id,
    fileName: uploadedFile.name,
    fileWebViewLink: uploadedFile.webViewLink,
    folderId: folder.id,
    folderName: folder.name,
    folderWebViewLink: folder.webViewLink || `https://drive.google.com/drive/folders/${folder.id}`,
  };
};

/**
 * Uploads a CSV backup file directly into the shared 'PunarChakra-Backups' folder in Google Drive
 */
export const uploadBackupCsvToDrive = async (
  fileName: string,
  csvContent: string
): Promise<BackupUploadResult> => {
  return uploadBackupFileToDriveFolder(
    fileName,
    'text/csv',
    csvContent,
    'PunarChakra complete CSV backup across all entities and AI/AR logs'
  );
};

/**
 * Uploads a JSON snapshot directly into the shared 'PunarChakra-Backups' folder in Google Drive
 */
export const uploadJsonBackupToDrive = async (
  fileName: string,
  jsonContent: string
): Promise<BackupUploadResult> => {
  return uploadBackupFileToDriveFolder(
    fileName,
    'application/json',
    jsonContent,
    'PunarChakra full JSON database snapshot'
  );
};

/**
 * Lists all backup files (CSV, JSON, Spreadsheets) stored inside 'PunarChakra-Backups' folder
 */
export const listBackupFilesInDrive = async (
  folderName: string = 'PunarChakra-Backups'
): Promise<DriveFileItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to browse Drive backups.');

  const folder = await getOrCreateDriveFolder(folderName);
  const query = `'${folder.id}' in parents and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,modifiedTime,size)&pageSize=30&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list files in '${folderName}': ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
};

/* =========================================================================
   Google Forms API v1 Client (Create, Read, BatchUpdate, Responses)
   ========================================================================= */

/**
 * Lists all Google Forms accessible in the user's Google Drive
 */
export const listGoogleFormsFromDrive = async (): Promise<DriveFileItem[]> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to list Google Forms.');

  const query = "mimeType='application/vnd.google-apps.form' and trashed=false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,modifiedTime)&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Google Forms from Drive: ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
};

const buildFormTemplateRequests = (templateType: GoogleFormTemplateType) => {
  if (templateType === 'cleanup_volunteer') {
    return {
      description:
        'Register for upcoming PunarChakra neighborhood cleanup drives across Bengaluru & Karnataka. Earn Eco Reward Points!',
      items: [
        {
          title: 'Volunteer Full Name',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: false } },
          },
        },
        {
          title: 'Preferred Cleanup Drive Locality',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'RADIO',
                options: [
                  { value: 'Indiranagar & Domlur' },
                  { value: 'Koramangala & HSR Layout' },
                  { value: 'Malleshwaram & Sankey Tank' },
                  { value: 'Whitefield & Bellandur' },
                ],
              },
            },
          },
        },
        {
          title: 'Phone / WhatsApp Contact',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: false } },
          },
        },
        {
          title: 'T-Shirt Size & Safety Kit Preference',
          questionItem: {
            question: {
              required: false,
              choiceQuestion: {
                type: 'DROP_DOWN',
                options: [{ value: 'S' }, { value: 'M' }, { value: 'L' }, { value: 'XL' }],
              },
            },
          },
        },
      ],
    };
  }

  if (templateType === 'b2b_bulk_intake') {
    return {
      description:
        'Commercial & Industrial EPR Bulk Scrap Pickup Intake Form for factories, offices, and tech parks.',
      items: [
        {
          title: 'Company / Facility Name & GSTIN',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: false } },
          },
        },
        {
          title: 'Primary Bulk Scrap Stream',
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: 'CHECKBOX',
                options: [
                  { value: 'E-Waste & IT Assets' },
                  { value: 'Industrial Copper & Metals' },
                  { value: 'Corrugated Pallets & Paper' },
                  { value: 'HDPE Drums & Polymer Offcuts' },
                ],
              },
            },
          },
        },
        {
          title: 'Estimated Monthly Tonnage (MT)',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: false } },
          },
        },
        {
          title: 'EPR Compliance & Loading Dock Notes',
          questionItem: {
            question: { required: false, textQuestion: { paragraph: true } },
          },
        },
      ],
    };
  }

  if (templateType === 'custom') {
    return {
      description: 'Custom PunarChakra circular economy & doorstep recycling intake survey.',
      items: [
        {
          title: 'Participant Name',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: false } },
          },
        },
        {
          title: 'Details / Feedback',
          questionItem: {
            question: { required: true, textQuestion: { paragraph: true } },
          },
        },
      ],
    };
  }

  // Default: Citizen Pickup Feedback Survey
  return {
    description:
      'Rate your PunarChakra doorstep scrap pickup, digital weighing transparency, and instant UPI payout experience.',
    items: [
      {
        title: 'Citizen Name & Locality (e.g., Indiranagar)',
        questionItem: {
          question: { required: true, textQuestion: { paragraph: false } },
        },
      },
      {
        title: 'Primary Recyclables Handed Over',
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'CHECKBOX',
              options: [
                { value: 'Heavy Copper / Metals' },
                { value: 'Corrugated Cardboard & Newspapers' },
                { value: 'PET / HDPE Plastics' },
                { value: 'E-Waste & Appliances' },
              ],
            },
          },
        },
      },
      {
        title: 'Pickup Executive & Digital Weighing Rating (1 = Poor, 5 = Excellent)',
        questionItem: {
          question: {
            required: true,
            scaleQuestion: { low: 1, high: 5, lowLabel: 'Needs Improvement', highLabel: 'Excellent' },
          },
        },
      },
      {
        title: 'Suggestions to Improve Doorstep Recycling',
        questionItem: {
          question: { required: false, textQuestion: { paragraph: true } },
        },
      },
    ],
  };
};

/**
 * Creates a structured Google Form using Forms API v1, adds questions via :batchUpdate,
 * and links the form inside 'PunarChakra-Backups' in Google Drive.
 */
export const createPunarChakraGoogleForm = async (
  title: string,
  templateType: GoogleFormTemplateType = 'pickup_feedback'
): Promise<GoogleFormSummary> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to create Google Forms.');

  const cleanTitle = title.trim() || 'PunarChakra Pickup Survey';

  // 1. Create empty form shell
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: cleanTitle,
        documentTitle: cleanTitle,
      },
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Forms create failed: ${errText}`);
  }

  const created = await createRes.json();
  const safeFormId = encodeURIComponent(String(created.formId).trim());

  // 2. Populate description and questions via batchUpdate
  const template = buildFormTemplateRequests(templateType);
  const requests = [
    {
      updateFormInfo: {
        info: {
          description: template.description,
        },
        updateMask: 'description',
      },
    },
    ...template.items.map((item, idx) => ({
      createItem: {
        item,
        location: { index: idx },
      },
    })),
  ];

  const batchRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeFormInResponse: true,
        requests,
      }),
    }
  );

  let updatedForm = created;
  if (batchRes.ok) {
    const batchJson = await batchRes.json();
    if (batchJson.form) {
      updatedForm = batchJson.form;
    }
  }

  // 3. Best-effort organize form inside PunarChakra-Backups in Drive
  try {
    const folder = await getOrCreateDriveFolder('PunarChakra-Backups');
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${safeFormId}?addParents=${encodeURIComponent(
        folder.id
      )}&fields=id,parents`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch {
    // Non-fatal
  }

  return parseGoogleFormObject(updatedForm, templateType);
};

const parseGoogleFormObject = (
  raw: any,
  templateType?: GoogleFormTemplateType
): GoogleFormSummary => {
  const questions: GoogleFormQuestion[] = (raw?.items || [])
    .filter((item: any) => item?.questionItem?.question)
    .map((item: any) => {
      const q = item.questionItem.question;
      let type: GoogleFormQuestion['type'] = 'OTHER';
      let options: string[] | undefined;

      if (q.textQuestion) {
        type = q.textQuestion.paragraph ? 'PARAGRAPH' : 'TEXT';
      } else if (q.choiceQuestion) {
        type = 'CHOICE';
        options = (q.choiceQuestion.options || []).map((o: any) => o.value).filter(Boolean);
      } else if (q.scaleQuestion) {
        type = 'SCALE';
      }

      return {
        itemId: item.itemId || '',
        questionId: q.questionId,
        title: item.title || 'Untitled Question',
        type,
        required: Boolean(q.required),
        options,
      };
    });

  return {
    formId: raw.formId,
    title: raw.info?.title || raw.info?.documentTitle || 'Untitled Google Form',
    description: raw.info?.description || '',
    responderUri: raw.responderUri,
    webViewLink: `https://docs.google.com/forms/d/${encodeURIComponent(String(raw.formId || '').trim())}/edit`,
    templateType,
    questions,
  };
};

/**
 * Fetches schema and metadata of a Google Form by ID
 */
export const getGoogleFormDetails = async (formId: string): Promise<GoogleFormSummary> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to inspect Google Forms.');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch Google Form: ${errText}`);
  }

  const raw = await res.json();
  return parseGoogleFormObject(raw);
};

/**
 * Reads all submitted responses for a Google Form and maps answer values to question prompts
 */
export const getGoogleFormResponses = async (
  formId: string
): Promise<{ form: GoogleFormSummary; responses: GoogleFormResponseItem[] }> => {
  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to read form responses.');

  const safeFormId = encodeURIComponent(formId.trim());
  const [form, respRes] = await Promise.all([
    getGoogleFormDetails(formId),
    fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!respRes.ok) {
    const errText = await respRes.text();
    throw new Error(`Failed to read Google Form responses: ${errText}`);
  }

  const respJson = await respRes.json();
  const questionTitleById = new Map<string, string>();
  form.questions.forEach((q) => {
    if (q.questionId) {
      questionTitleById.set(q.questionId, q.title);
    }
  });

  const responses: GoogleFormResponseItem[] = (respJson.responses || []).map((r: any) => {
    const rawAnswers = r.answers || {};
    const answers = Object.entries(rawAnswers).map(([qId, ansObj]: [string, any]) => {
      const vals = (ansObj?.textAnswers?.answers || [])
        .map((a: any) => a.value)
        .filter(Boolean)
        .join(', ');
      return {
        questionTitle: questionTitleById.get(qId) || `Question (${qId})`,
        answerText: vals || '—',
      };
    });

    return {
      responseId: r.responseId,
      createTime: r.createTime,
      lastSubmittedTime: r.lastSubmittedTime,
      respondentEmail: r.respondentEmail,
      answers,
    };
  });

  return {
    form: { ...form, responseCount: responses.length },
    responses,
  };
};

/**
 * Updates a Google Form's title and description.
 * (MANDATORY: Requires explicit user confirmation before mutating Google Form)
 */
export const updateGoogleFormMetadata = async (
  formId: string,
  newTitle: string,
  newDescription: string,
  onConfirmCallback: () => boolean | Promise<boolean>
): Promise<GoogleFormSummary> => {
  const confirmed = await onConfirmCallback();
  if (!confirmed) {
    throw new Error('Google Form update cancelled by user.');
  }

  const token = getWorkspaceAccessToken();
  if (!token) throw new Error('Please sign in with Google to update Google Forms.');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(
    `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeFormInResponse: true,
        requests: [
          {
            updateFormInfo: {
              info: {
                title: newTitle.trim(),
                description: newDescription.trim(),
              },
              updateMask: 'title,description',
            },
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update Google Form: ${errText}`);
  }

  const data = await res.json();
  return parseGoogleFormObject(data.form || { formId, info: { title: newTitle, description: newDescription } });
};

