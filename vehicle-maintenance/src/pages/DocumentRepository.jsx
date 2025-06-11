import React, { useState } from 'react';
import { FileText, Upload, Eye } from 'lucide-react';
import '../styles/Documentrepo.css';

const DocumentRepository = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState('');
  const [documents, setDocuments] = useState({
    "Driver's License": [],
    "Insurance PDF": [],
    "Registration PDF": [],
    "Pollution PDF": []
  });

  const categories = ["Driver's License", "Insurance PDF", "Registration PDF", "Pollution PDF"];

  const handleUpload = () => {
    if (!selectedFile || !category || !customName.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    const doc = {
      name: customName.trim(),
      file: URL.createObjectURL(selectedFile)
    };

    setDocuments((prev) => ({
      ...prev,
      [category]: [...prev[category], doc]
    }));

    // Reset inputs
    setSelectedFile(null);
    setCustomName('');
    setCategory('');
    document.getElementById('fileInput').value = '';
  };

  return (
    <div className="document-repository-container">
      <div className="document-repository-header">
        <div className="header-content">
          <h1 className="page-title">
            Document Repository
          </h1>
          <p className="page-subtitle">Upload and manage your vehicle documents</p>
        </div>
      </div>

      <div className="upload-form-card">
        <div className="form-header">
          <h3>Upload New Document</h3>
          <p>Add a new document to your repository</p>
        </div>

        <form className="upload-form">
          <div className="form-group">
            <label>
              Upload PDF
            </label>
            <input
              type="file"
              id="fileInput"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>

          <div className="form-group">
            <label>
              Custom File Name
            </label>
            <input
              type="text"
              value={customName}
              placeholder="e.g., John_Driving_License.pdf"
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Select Category
            </label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" selected disabled>Choose...</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn-primary" onClick={handleUpload}>
            <Upload size={16} />
            Upload Document
          </button>
        </form>
      </div>

      <div className="documents-section">
        {categories.map((cat) => (
          <div key={cat} className="category-card">
            <div className="category-header">
              <h4>
                <FileText className="category-icon" />
                {cat}
              </h4>
            </div>

            {documents[cat].length === 0 ? (
              <div className="empty-state">
                <FileText className="empty-icon" size={48} />
                <p>No documents uploaded.</p>
              </div>
            ) : (
              <div className="document-list">
                {documents[cat].map((doc, idx) => (
                  <div key={idx} className="document-item">
                    <div className="document-name">
                      <FileText className="document-icon" />
                      {doc.name}
                    </div>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-primary"
                    >
                      <Eye size={16} />
                      View PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentRepository;
