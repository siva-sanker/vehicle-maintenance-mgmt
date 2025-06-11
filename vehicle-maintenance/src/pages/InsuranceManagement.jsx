import React, { useEffect, useState } from 'react';
import '../styles/insurance.css';

const InsuranceManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
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

  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    setVehicles(storedVehicles);
  }, []);

  return (
    <div className="container-fluid my-3">
      <h2 className="insurance mb-4 p-2 mt-2">📑 Insurance Management</h2>

      {/* Insurance Table */}
      <div className="table-responsive">
        <h4 className="insurance mb-3 p-2">Vehicle Insurance Details</h4>
        <table className="table table-bordered table-hover text-center">
          <thead className="table">
            <tr>
              <th>#</th>
              <th>Make</th>
              <th>Model</th>
              <th>Reg. Number</th>
              <th>Policy #</th>
              <th>Insurer</th>
              <th>Type</th>
              <th>Start</th>
              <th>End</th>
              <th>Premium</th>
              {/* <th>Vehicle Type</th> */}
              <th>Chassis</th>
              <th>Engine</th>
              <th>Issue Date</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="15" className="text-center">No vehicles found.</td>
              </tr>
            ) : (
              vehicles.map((v, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className='text-capitalize'>{v.make}</td>
                  <td className='text-capitalize'>{v.model}</td>
                  <td className='text-uppercase'>{v.registrationNumber}</td>
                  <td className='text-uppercase'>{v.insurance?.policyNumber || '-'}</td>
                  <td className='text-capitalize'>{v.insurance?.insurer || '-'}</td>
                  <td>{v.insurance?.policyType || '-'}</td>
                  <td>{v.insurance?.startDate || '-'}</td>
                  <td>{v.insurance?.endDate || '-'}</td>
                  <td>{v.insurance?.premiumAmount ? `${v.insurance.premiumAmount} /-` : '-'}</td>
                  {/* <td className='text-capitalize'>{v.insurance?.vehicleType || '-'}</td> */}
                  <td className='text-uppercase'>{v?.chassisNumber || '-'}</td>
                  <td className='text-uppercase'>{v?.engineNumber || '-'}</td>
                  <td>{v.insurance?.issueDate || '-'}</td>
                  <td>{v.insurance?.paymentMode || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsuranceManagement;
