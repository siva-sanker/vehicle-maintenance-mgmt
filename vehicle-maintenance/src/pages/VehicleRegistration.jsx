import React, { useState } from 'react';
import '../styles/registration.css'
const VehicleRegistration = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    purchaseDate: '',
    registrationNumber: '',
    purchasePrice:'',
    fuelType: '',
    engineNumber:'',
    chassisNumber:'',
    kilometers: '',
    color: '',
    owner: '',
    phone: '',
    address: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      'make',
      'model',
      'purchaseDate',
      'registrationNumber',
      'purchasePrice',
      'fuelType',
      'engineNumber',
      'chassisNumber',
      'kilometers',
      'color',
      'owner',
      'phone',
      'address'
    ];

    const emptyField = requiredFields.find(field => !formData[field]);

    if (emptyField) {
      alert('Please fill in all fields.');
      return;
    }

    const existing = JSON.parse(localStorage.getItem('vehicles') || '[]');
    existing.push(formData);
    localStorage.setItem('vehicles', JSON.stringify(existing));

    setSubmitted(true);
    setFormData({
      make: '',
      model: '',
      purchaseDate: '',
      purchasePrice:'',
      registrationNumber: '',
      engineNumber:'',
      chassisNumber:'',
      fuelType: '',
      kilometers: '',
      color: '',
      owner: '',
      phone: '',
      address: ''
    });
  };

  return (
    <div className="container-fluid my-3">
      <h2 className="registration mb-4 mt-2 p-2">🚑 Vehicle Registration</h2>

      {submitted && (
        <div className="alert alert-success" role="alert">
          Vehicle registered successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Make</label>
            <input type="text" className="form-control" name="make" placeholder='Vehicle make / Brand' value={formData.make} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Model</label>
            <input type="text" className="form-control" name="model" placeholder='Vehicle model' value={formData.model} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Purchase Date</label>
            <input type="date" className="form-control" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Purchase Price</label>
            <input type="number" className="form-control" name="purchasePrice" placeholder='Enter purchase price' value={formData.purchasePrice} onChange={handleChange} min={45000} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Registration Number</label>
            <input type="text" className="form-control" name="registrationNumber" placeholder='Registration number' value={formData.registrationNumber} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Fuel Type</label>
            <select className="form-select" name="fuelType" value={formData.fuelType} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Kilometers</label>
            <input type="number" className="form-control" name="kilometers" placeholder='Kilometers driven' value={formData.kilometers} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Color</label>
            <input type="text" className="form-control" name="color" placeholder='Vehicle Color' value={formData.color} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Engine Number</label>
            <input type="text" className="form-control" name="engineNumber" placeholder='Engine Number' value={formData.engineNumber} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Chassis Number</label>
            <input type="text" className="form-control" name="chassisNumber" placeholder='Chassis Number' value={formData.chassisNumber} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Owner Name</label>
            <input type="text" className="form-control" name="owner" placeholder='Owner Name' value={formData.owner} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Owner Contact</label>
            <input type="text" className="form-control" name="phone" placeholder='Owner Phone' value={formData.phone} onChange={handleChange} />
          </div>

          <div className="col-md-12 mb-3">
            <label className="form-label">Owner Address</label>
            <textarea className="form-control" name="address" placeholder='Owner Address' rows="2" value={formData.address} onChange={handleChange}></textarea>
          </div>
        </div>

        <button type="submit" className="registerBtn btn mb-3">Register Vehicle</button>
      </form>
    </div>
  );
};

export default VehicleRegistration;
