import React, { useState, useEffect } from 'react';
import { FileText, Upload, Eye } from 'lucide-react';
import '../styles/Documentrepo.css';
import ButtonWithGradient from '../components/ButtonWithGradient';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { vehicleAPI, Vehicle } from '../services/api';
import InputText from '../components/InputText';
import SelectInput from '../components/SelectInput';

// interface DocumentRepositoryProps {
//   sidebarCollapsed: boolean;
//   toggleSidebar: () => void;
// }

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

const DocumentRepository: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [documents, setDocuments] = useState<Documents>({
    "Driver's License": [],
    "Insurance PDF": [],
    "Registration PDF": [],
    "Pollution PDF": []
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const categories = ["Driver's License", "Insurance PDF", "Registration PDF", "Pollution PDF"];

  useEffect(() => {
    vehicleAPI.getAllVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  const handleUpload = (): void => {
    if (!selectedFile || !category || !customName.trim() || !selectedVehicleId) {
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
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator  /> */}
      <PageContainer>
      {/* <div className="document-repository-container"> */}
      <div className="dashboard-content">
        <SectionHeading title='Document Repository' subtitle='Upload and manage your vehicle documents'/>

        <div className="upload-form-card">
          <div className="form-header">
            <h3>Upload New Document</h3>
            <p>Add a new document to your repository</p>
          </div>

          <form className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <SelectInput 
                  name='vehicle' 
                  label='Select Vehicle' 
                  value={selectedVehicleId} 
                  onChange={e => setSelectedVehicleId(e.target.value)} 
                  options={[
                    { value: '', label: 'Choose Vehicle...', disabled: true },
                    ...vehicles.map(v => ({
                      value: v.id,
                      label: `${v.registrationNumber.toUpperCase()} - ${v.make} ${v.model}`
                    }))
                  ]}
                />
              </div>

              <div className="form-group">
                <label className='mb-0'>
                  Upload PDF
                </label>
                <input
                  type="file"
                  className='form-control'
                  id="fileInput"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <InputText name='fileName' label='Custom File Name' type='text' value={customName} placeholder="e.g., John_Driving_License.pdf" onChange={(e) => setCustomName(e.target.value)}/>
              </div>

              <div className="form-group">
                <SelectInput 
                  name='category' 
                  label='Select Category' 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder='Choose...'
                  options={[
                    { value: '', label: 'Choose Category...', disabled: true },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16}}>
              <div>
                <ButtonWithGradient text='Upload Document' type='button' onClick={handleUpload} />
              </div>
            </div>
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
                <div className="document-list ">
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
      {/* </div> */}
      </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default DocumentRepository; 