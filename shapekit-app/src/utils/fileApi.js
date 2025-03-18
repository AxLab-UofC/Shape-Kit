const API_BASE_URL = '/api';

export const saveFile = async (fileName, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName, data }),
    });
    if (!response.ok) throw new Error('Failed to save file');
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

export const getFile = async (fileName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileName}`);
    if (!response.ok) throw new Error('Failed to get file');
    return await response.json();
  } catch (error) {
    console.error('Error getting file:', error);
    throw error;
  }
};

export const deleteFile = async (fileName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileName}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete file');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const listFiles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/files`);
    if (!response.ok) throw new Error('Failed to list files');
    return await response.json();
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};
