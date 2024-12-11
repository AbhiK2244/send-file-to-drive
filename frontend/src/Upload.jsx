import { useState } from 'react';
import './Upload.css';

const Upload = () => {
  const [message, setMessage] = useState('');

  const handleFileUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch('https://send-file-to-drive-backend.vercel.app/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`File uploaded successfully! File ID: ${result.fileId}`);
      } else {
        setMessage(result.message || 'Error uploading file.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error uploading file.');
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload File</h1>
      <form onSubmit={handleFileUpload}>
        <input type="file" name="file" required />
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;
