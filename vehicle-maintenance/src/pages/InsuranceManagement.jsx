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

  useEffect(() => {
  if (selectedIndex !== '') {
    const selectedVehicle = vehicles[selectedIndex];
    if (selectedVehicle) {
      setInsuranceData(prev => ({
        ...prev,
        chassisNumber: selectedVehicle.chassisNumber || '',
        engineNumber: selectedVehicle.engineNumber || '',
        vehicleType: selectedVehicle.vehicleType || ''
      }));
    }
  }
}, [selectedIndex, vehicles]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setInsuranceData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex === '') {
      alert("Please select a vehicle.");
      return;
    }

    const updatedVehicles = [...vehicles];
    updatedVehicles[selectedIndex].insurance = insuranceData;

    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setVehicles(updatedVehicles);
    alert("Insurance details added!");

    setSelectedIndex('');
    setInsuranceData({
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
  };

  return (
    <div className="container-fluid my-3">
      <h2 className="insurance mb-4 p-2 mt-2">📑 Insurance Management</h2>

      {/* <form onSubmit={handleSubmit} className="insuranceForm mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-6 col-lg-4">
            <label className="form-label">Select Vehicle</label>
            <select
              className="form-select text-capitalize"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value)}
            >
              <option value="">-- Select --</option>
              {vehicles.map((v, index) => (
                <option key={index} value={index}>
                  {v.make} {v.model} - {v.registrationNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Policy Number</label>
            <input
              type="text"
              className="form-control"
              name="policyNumber"
              placeholder='Policy Number'
              value={insuranceData.policyNumber}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Insurer Name</label>
            <input
              type="text"
              className="form-control"
              name="insurer"
              placeholder='Insurance Company Name'
              value={insuranceData.insurer}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Policy Type</label>
            <select
              className="form-select"
              name="policyType"
              value={insuranceData.policyType}
              onChange={handleChange}
            >
              <option value="">-- Select Policy Type --</option>
              <option value="Comprehensive">Comprehensive</option>
              <option value="Third Party">Third Party</option>
            </select>
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={insuranceData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={insuranceData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Premium Amount</label>
            <input
              type="number"
              className="form-control"
              name="premiumAmount"
              value={insuranceData.premiumAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Vehicle Type</label>
            <input
              type="text"
              className="form-control"
              name="vehicleType"
              placeholder='Vehicle Type'
              value={insuranceData.vehicleType}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Chassis Number</label>
            <input
              type="text"
              className="form-control"
              name="chassisNumber"
              placeholder='Chassis Number'
              value={insuranceData.chassisNumber}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Engine Number</label>
            <input
              type="text"
              className="form-control"
              name="engineNumber"
              placeholder='Engine Number'
              value={insuranceData.engineNumber}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Policy Issue Date</label>
            <input
              type="date"
              className="form-control"
              name="policyIssueDate"
              value={insuranceData.policyIssueDate}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 col-lg-4">
            <label className="form-label">Payment Mode</label>
            <select
              className="form-select"
              name="paymentMode"
              value={insuranceData.paymentMode}
              onChange={handleChange}
            >
              <option value="">-- Select Payment Mode --</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online Payment">Online Payment</option>
            </select>
          </div>

          <div className="col-12 mt-2">
            <button type="submit" className="insuranceBtn btn ">Save Insurance</button>
          </div>
        </div>
      </form> */}

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
                  <td>{v.insurance?.premiumAmount ? `$${v.insurance.premiumAmount}` : '-'}</td>
                  {/* <td className='text-capitalize'>{v.insurance?.vehicleType || '-'}</td> */}
                  <td className='text-uppercase'>{v.insurance?.chassisNumber || '-'}</td>
                  <td className='text-uppercase'>{v.insurance?.engineNumber || '-'}</td>
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
