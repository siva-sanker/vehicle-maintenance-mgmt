import React, { useState } from 'react';
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
    <div className="container-fluid my-3">
      <h2 className="document mb-4 mt-2 p-2">📁 Document Repository</h2>

      <div className="card p-4 mb-4 shadow">
        <div className="mb-3">
          <label className="form-label">Upload PDF</label>
          <input
            type="file"
            className="form-control"
            id="fileInput"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Custom File Name</label>
          <input
            type="text"
            className="form-control"
            value={customName}
            placeholder="e.g., John_Driving_License.pdf"
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Select Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Choose...</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button className="documentBtn btn " onClick={handleUpload}>Upload Document</button>
      </div>

      <div>
        {categories.map((cat) => (
          <div key={cat} className="mb-5">
            <h4 className="text-secondary">{cat}</h4>
            {documents[cat].length === 0 ? (
              <p className="text-muted">No documents uploaded.</p>
            ) : (
              <ul className="list-group">
                {documents[cat].map((doc, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    {doc.name}
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      View PDF
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentRepository;
