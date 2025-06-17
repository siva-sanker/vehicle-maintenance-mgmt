import React, { useState } from 'react';
import { FileText, Upload, Eye } from 'lucide-react';
import '../styles/Documentrepo.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface DocumentRepositoryProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface Document {
  name: string;
  file: string;
}

interface Documents {
  "Driver's License": Document[];
  "Insurance PDF": Document[];
  "Registration PDF": Document[];
  "Pollution PDF": Document[];
}

const DocumentRepository: React.FC<DocumentRepositoryProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [documents, setDocuments] = useState<Documents>({
    "Driver's License": [],
    "Insurance PDF": [],
    "Registration PDF": [],
    "Pollution PDF": []
  });

  const categories = ["Driver's License", "Insurance PDF", "Registration PDF", "Pollution PDF"];

  const handleUpload = (): void => {
    if (!selectedFile || !category || !customName.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    const doc: Document = {
      name: customName.trim(),
      file: URL.createObjectURL(selectedFile)
    };

    setDocuments((prev) => ({
      ...prev,
      [category]: [...prev[category as keyof Documents], doc]
    }));

    // Reset inputs
    setSelectedFile(null);
    setCustomName('');
    setCategory('');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
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
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
                <option value="" disabled>Choose...</option>
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

              {documents[cat as keyof Documents].length === 0 ? (
                <div className="empty-state">
                  <FileText className="empty-icon" size={48} />
                  <p>No documents uploaded.</p>
                </div>
              ) : (
                <div className="document-list">
                  {documents[cat as keyof Documents].map((doc, idx) => (
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
      <Footer />
    </>
  );
};

export default DocumentRepository; 