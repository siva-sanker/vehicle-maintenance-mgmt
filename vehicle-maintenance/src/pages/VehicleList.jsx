import React, { useEffect, useState } from 'react';
import '../styles/Vehiclelist.css';
import calender from '../assets/calendar.png';
import boss from '../assets/boss.png';
import key from '../assets/key.png';
import paper from '../assets/paper.png';
import fuel from '../assets/fuel.png';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [insuranceData, setInsuranceData] = useState({
    policyNumber: '',
    insurer: '',
    policytype:'',
    startDate: '',
    endDate: '',
    issueDate:'',
    premiumAmount: '',
  });

  const calculateVehicleAge = (purchaseDateString) => {
    const purchaseDate = new Date(purchaseDateString);
    const today = new Date();

    let age = today.getFullYear() - purchaseDate.getFullYear();
    const monthDiff = today.getMonth() - purchaseDate.getMonth();
    const dayDiff = today.getDate() - purchaseDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    setVehicles(storedVehicles);
  }, []);

  const handleAddInsurance = () => {
    const updatedVehicles = vehicles.map((v) =>
      v.registrationNumber === selectedVehicle.registrationNumber
        ? { ...v, insurance: insuranceData }
        : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setShowModal(false);
  };

  return (
    <div className="container-fluid my-3">
      <h2 className="vehiclelist mb-4 mt-2 p-2">📃 Registered Vehicles</h2>

      {vehicles.length === 0 ? (
        <div className="alert alert-info text-center fs-5">
          No vehicles registered yet.
        </div>
      ) : (
        <div className="row">
          {vehicles.map((vehicle, index) => (
            <div className="col-md-6 col-lg-3 mb-4" key={index}>
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 text-capitalize">{vehicle.make} {vehicle.model}</h5>
                    <small className="text-muted text-uppercase">Reg: {vehicle.registrationNumber}</small>
                  </div>
                  <span className="badge bg-light text-dark border">
                    {new Date(vehicle.purchaseDate).getFullYear()}
                  </span>
                </div>

                <div className="card-body">
                  <div className="row">
                    <div className="d-flex align-items-center mb-2">
                      <img src={calender} alt="Calendar" className="vehicleListImg me-1" />
                      <h6 className="mb-0">Basic Info</h6>
                    </div>
                    <div className="col-6"><strong>Color:</strong> {vehicle.color}</div>
                    <div className="col-6"><strong>Age:</strong> {calculateVehicleAge(vehicle.purchaseDate)} years</div>
                  </div>

                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <div className="d-flex align-items-center">
                        <img src={fuel} alt="fuel" className="vehicleListImg me-2" />
                        <h6 className="mb-0 me-2">Fuel Type:</h6>
                        <span className={`badge fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
                          {vehicle.fuelType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr />
                  <div className="d-flex align-items-center mb-2">
                    <img src={key} alt="Key" className="vehicleListImg me-1" />
                    <h6 className="mb-0">Purchase Info</h6>
                  </div>

                  <div className="row">
                    <div className="col-6"><strong>Engine No.:</strong> {vehicle.engineNumber}</div>
                    <div className="col-6"><strong>Chassis No.:</strong> {vehicle.chassisNumber}</div>
                    <div className="col-6 mt-2"><strong>Price:</strong> ${vehicle.purchasePrice}</div>
                  </div>

                  <hr />
                  <div className="d-flex align-items-center mb-2">
                    <img src={boss} alt="Owner" className="vehicleListImg me-1" />
                    <h6 className="mb-0">Owner Info</h6>
                  </div>
                  
                  <div className="row">
                    <div className="col-6"><strong>Owner:</strong> {vehicle.owner}</div>
                    <div className="col-6"><strong>Phone:</strong> {vehicle.phone}</div>
                  </div>
                  <div className="mt-2"><strong>Address:</strong> {vehicle.address}</div>

                  {vehicle.insurance ? (
                    <>
                      <hr />
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <img src={paper} alt="Owner" className="vehicleListImg me-1" />
                          <h6 className="mb-0">Insurance Info</h6>
                        </div>
                        <div className="row">
                          <div className='col-4'><strong>Policy #:</strong> {vehicle.insurance.policyNumber}</div>
                          <div className='col-4'><strong>Insurer:</strong> {vehicle.insurance.insurer}</div>
                          <div className='col-4'><strong>Premium:</strong> ₹{vehicle.insurance.premiumAmount}</div>
                        </div>
                        <div className="row">
                          <div className='col-6'><strong>Start:</strong> {vehicle.insurance.startDate}</div>
                          <div className='col-6'><strong>End:</strong> {vehicle.insurance.endDate}</div>
                          <div className='col-6'><strong>Issue:</strong> {vehicle.insurance.issueDate}</div>
                        </div>
                      </div>
                    </>
                  ):(<p className='text-danger'>No insurance</p>)}
                </div>

                <div className="card-footer d-flex justify-content-between align-items-center">
                  <strong>Purchase Date:</strong> {vehicle.purchaseDate}
                  <button
                    className='btn btn-outline-primary ms-auto'
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowModal(true);
                      setInsuranceData({
                        policyNumber: '',
                        insurer: '',
                        startDate: '',
                        endDate: '',
                        issueDate:'',
                        premiumAmount: '',
                      });
                    }}
                  >
                    Add Insurance
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insurance Modal */}
      {selectedVehicle && (
        <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Insurance for {selectedVehicle.registrationNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Engine No:</strong> {selectedVehicle.engineNumber}</p>
                <p><strong>Chassis No:</strong> {selectedVehicle.chassisNumber}</p>

                <div className="mb-2">
                  <label>Policy Type:</label>
                  <select className='form-control' value={insuranceData.policyType} 
                    onChange={(e)=>setInsuranceData({...insuranceData,policyType:e.target.value})}>
                      <option value="">Select</option>
                      <option value="Third Party">Third Party</option>
                      <option value="Comprehensive">Comprehensive</option>
                      <option value="Full Cover">Full Cover</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label>Policy Number:</label>
                  <input className="form-control" type="text" value={insuranceData.policyNumber} onChange={(e) => setInsuranceData({ ...insuranceData, policyNumber: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>Insurer:</label>
                  <input className="form-control" type="text" value={insuranceData.insurer} onChange={(e) => setInsuranceData({ ...insuranceData, insurer: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>Start Date:</label>
                  <input className="form-control" type="date" value={insuranceData.startDate} onChange={(e) => setInsuranceData({ ...insuranceData, startDate: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>End Date:</label>
                  <input className="form-control" type="date" value={insuranceData.endDate} onChange={(e) => setInsuranceData({ ...insuranceData, endDate: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>Issue Date:</label>
                  <input className="form-control" type="date" value={insuranceData.issueDate} onChange={(e) => setInsuranceData({ ...insuranceData, issueDate: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>Premium Amount:</label>
                  <input className="form-control" type="number" value={insuranceData.premiumAmount} onChange={(e) => setInsuranceData({ ...insuranceData, premiumAmount: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label>Payment Mode:</label>
                  <select
                    className="form-control"
                    value={insuranceData.paymentMode || ''}
                    onChange={(e) =>
                      setInsuranceData({ ...insuranceData, paymentMode: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select> 
                  </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddInsurance}>Save Insurance</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
