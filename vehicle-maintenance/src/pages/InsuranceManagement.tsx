import React, { useEffect, useState } from 'react';
import { FileText, Car, Calendar, DollarSign, Shield, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/insurance.css';

interface InsuranceManagementProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  insurance?: {
    policyNumber?: string;
    insurer?: string;
    policytype?: string;
    startDate?: string;
    endDate?: string;
    premiumAmount?: string;
    issueDate?: string;
    payment?: string;
  };
}

interface InsuranceData {
  policyNumber: string;
  insurer: string;
  expiryDate: string;
  policyType: string;
  startDate: string;
  endDate: string;
  premiumAmount: string;
  vehicleType: string;
  chassisNumber: string;
  engineNumber: string;
  policyIssueDate: string;
  paymentMode: string;
}

const InsuranceManagement: React.FC<InsuranceManagementProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [insuranceData, setInsuranceData] = useState<InsuranceData>({
    policyNumber: '',
    insurer: '',
    expiryDate: '',
    policyType: '',
    startDate: '',
    endDate: '',
    premiumAmount: '',
    vehicleType: '',
    chassisNumber: '',
    engineNumber: '',
    policyIssueDate: '',
    paymentMode: ''
  });

  const filteredVehicles = vehicles.filter((v) =>
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchVehicles = async (): Promise<void> => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Function to determine date status and return appropriate CSS class
  const getDateStatusClass = (endDate: string): string => {
    if (!endDate || endDate === '-') return 'date-cell';
    
    const today = new Date();
    const end = new Date(endDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'date-cell date-expired'; // Past due - red
    } else if (diffDays <= 5) {
      return 'date-cell date-expiring-soon'; // Expiring within 5 days - orange
    } else {
      return 'date-cell date-valid'; // Valid - green
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="insurance-container">
        <div className="insurance-header">
          <div className="header-content">
            <h1 className="page-title">
              {/* <FileText className="page-icon" /> */}
              Insurance Management
            </h1>
            <p className="page-subtitle">Manage vehicle insurance policies and details</p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              {/* <Search className="search-icon" size={20} /> */}
              <i className="search-icon fa-solid fa-magnifying-glass"></i>
              <input
                type="search"
                name="searchVehicle"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by registration number..."
                className="search-input"
              />
            </div>
          </div>
        </div>
        <div className="insurance-content">
          <div className="content-header">
            <div className="section-header">
              <Shield size={20} className="section-icon" />
              <h3>Vehicle Insurance Details</h3>
            </div>
          </div>

          <div className="table-container">
            <table className="insurance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <Car size={16} className="table-icon" />
                    Make
                  </th>
                  <th>
                    <Car size={16} className="table-icon" />
                    Model
                  </th>
                  <th>Reg. Number</th>
                  <th>
                    <FileText size={16} className="table-icon" />
                    Policy #
                  </th>
                  <th>Insurer</th>
                  <th>Type</th>
                  <th>
                    <Calendar size={16} className="table-icon" />
                    Start
                  </th>
                  <th>
                    <Calendar size={16} className="table-icon" />
                    End
                  </th>
                  <th>
                    <DollarSign size={16} className="table-icon" />
                    Premium
                  </th>
                  <th>Chassis</th>
                  <th>Engine</th>
                  <th>Issue Date</th>
                  <th>
                    <CreditCard size={16} className="table-icon" />
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="no-data">
                      <div className="no-data-content">
                        <FileText size={48} className="no-data-icon" />
                        <p>No vehicles found matching your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentVehicles.map((v, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="row-number">{startIndex + idx + 1}</td>
                      <td className="text-capitalize">{v.make}</td>
                      <td className="text-capitalize">{v.model}</td>
                      <td className="text-uppercase reg-number">{v.registrationNumber}</td>
                      <td className="text-uppercase policy-number">{v.insurance?.policyNumber || '-'}</td>
                      <td className="text-capitalize">{v.insurance?.insurer || '-'}</td>
                      <td className="policy-type">{v.insurance?.policytype || '-'}</td>
                      <td className="date-cell">{v.insurance?.startDate || '-'}</td>
                      <td className={getDateStatusClass(v.insurance?.endDate || '')}>{v.insurance?.endDate || '-'}</td>
                      <td className="premium-amount">
                        {v.insurance?.premiumAmount ? `₹${v.insurance.premiumAmount}` : '-'}
                      </td>
                      <td className="text-uppercase">{v?.chassisNumber || '-'}</td>
                      <td className="text-uppercase">{v?.engineNumber || '-'}</td>
                      <td className="date-cell">{v.insurance?.issueDate || '-'}</td>
                      <td className="text-capitalize payment-mode">{v.insurance?.payment || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredVehicles.length > itemsPerPage && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
                {searchTerm && ` (filtered from ${vehicles.length} total)`}
              </div>
              
              {/* Date Status Legend */}
              <div className="date-legend">
                <span className="legend-title">End Date Status:</span>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color date-valid">Valid</span>
                    {/* <span className="legend-text">More than 5 days remaining</span> */}
                  </div>
                  <div className="legend-item">
                    <span className="legend-color date-expiring-soon">Expiring Soon</span>
                    {/* <span className="legend-text">Within 5 days</span> */}
                  </div>
                  <div className="legend-item">
                    <span className="legend-color date-expired">Expired</span>
                    {/* <span className="legend-text">Past due date</span> */}
                  </div>
                </div>
              </div>

              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      className={`page-number ${currentPage === number ? 'active' : ''}`}
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InsuranceManagement; 