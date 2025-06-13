import React, { useEffect, useState } from 'react';
import { Search, FileText, Car, Calendar, DollarSign, Shield, CreditCard } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/insurance.css';

const InsuranceManagement = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [insuranceData, setInsuranceData] = useState({
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

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="insurance-container">
        <div className="insurance-header">
          <div className="header-content">
            <h1 className="page-title">
              <FileText className="page-icon" />
              Insurance Management
            </h1>
            <p className="page-subtitle">Manage vehicle insurance policies and details</p>
          </div>
          <div className="header-actions">
            <div className="search-container">
              <Search className="search-icon" size={20} />
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
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="no-data">
                      <div className="no-data-content">
                        <FileText size={48} className="no-data-icon" />
                        <p>No vehicles found matching your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((v, idx) => (
                    <tr key={idx} className="table-row">
                      <td className="row-number">{idx + 1}</td>
                      <td className="text-capitalize">{v.make}</td>
                      <td className="text-capitalize">{v.model}</td>
                      <td className="text-uppercase reg-number">{v.registrationNumber}</td>
                      <td className="text-uppercase policy-number">{v.insurance?.policyNumber || '-'}</td>
                      <td className="text-capitalize">{v.insurance?.insurer || '-'}</td>
                      <td className="policy-type">{v.insurance?.policytype || '-'}</td>
                      <td className="date-cell">{v.insurance?.startDate || '-'}</td>
                      <td className="date-cell">{v.insurance?.endDate || '-'}</td>
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InsuranceManagement;