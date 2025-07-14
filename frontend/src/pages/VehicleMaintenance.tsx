import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import Header from "../components/Header";
import PageContainer from "../components/PageContainer";
import SectionHeading from "../components/SectionHeading";
import ButtonWithGradient from "../components/ButtonWithGradient";
import Cards from "../components/Cards";
import ReusableModal from "../components/ReusableModal";
import InputText from "../components/InputText";
import SelectInput from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import FormDateInput from "../components/Date";
import Table from "../components/Table";
import { vehicleAPI, Vehicle, maintenanceAPI, Maintenance } from "../services/api";

const VehicleMaintenance: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    serviceDate: "",
    serviceType: "",
    description: "",
    cost: "",
    nextServiceDate: "",
    serviceCenter: "",
    technician: "",
    status: "Scheduled",
    odometerReadingBefore: "",
    odometerReadingAfter: ""
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    const fetchMaintenance = async () => {
      setMaintenanceLoading(true);
      try {
        const data = await maintenanceAPI.getAllMaintenance();
        setMaintenanceRecords(data);
      } catch (err) {
        setMaintenanceRecords([]);
      } finally {
        setMaintenanceLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  const activeCount = vehicles.filter(v => v.status === "active").length;
  const maintenanceCount = vehicles.filter(v => v.status === "maintenance").length;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Simple form validation to prevent null/empty values
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for null/empty required fields
    if (!form.vehicleId || form.vehicleId.trim() === '') {
      errors.push('Vehicle is required');
    }

    if (!form.serviceDate || form.serviceDate.trim() === '') {
      errors.push('Service date is required');
    }

    if (!form.serviceType || form.serviceType.trim() === '') {
      errors.push('Service type is required');
    }

    if (!form.description || form.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!form.cost || form.cost.trim() === '') {
      errors.push('Cost is required');
    }
    if (!form.odometerReadingBefore || form.odometerReadingBefore.trim() === '') {
      errors.push('Odometer reading Before is required');
    }
    if (!form.odometerReadingAfter || form.odometerReadingAfter.trim() === '') {
      errors.push('Odometer reading After is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async () => {
    // Validate form before submission
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show validation errors in alert
      const errorMessage = validation.errors.join('\n');
      alert(`Please fill in all required fields:\n${errorMessage}`);
      return;
    }

    try {
      const maintenanceData = {
        vehicleId: form.vehicleId,
        serviceDate: form.serviceDate,
        serviceType: form.serviceType,
        description: form.description,
        cost: parseFloat(form.cost),
        status: "Completed",
        odometerReadingBefore: parseFloat(form.odometerReadingBefore) || 0,
        odometerReadingAfter: parseFloat(form.odometerReadingAfter) || 0,
        serviceCenter: "Auto Service Center",
        technician: "Technician"
      };

      await maintenanceAPI.createMaintenance(maintenanceData);
      
      // Refresh maintenance records
      const updatedRecords = await maintenanceAPI.getAllMaintenance();
      setMaintenanceRecords(updatedRecords);
      
      // Reset form
      setForm({
        vehicleId: "",
        serviceDate: "",
        serviceType: "",
        description: "",
        cost: "",
        nextServiceDate: "",
        serviceCenter: "",
        technician: "",
        status: "Scheduled",
        odometerReadingBefore: "",
        odometerReadingAfter: ""
      });
      
      setIsModalOpen(false);
      
      // Show success toast message
      toast.success('Maintenance record added successfully!');
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      toast.error('Failed to add maintenance record. Please try again.');
    }
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <SectionHeading title="Vehicle Maintenance" subtitle="Vehicle maintenance records" />
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Cards title="Total Active Vehicles" subtitle={loading ? "-" : activeCount} />
          <Cards title="Vehicles in Maintenance" subtitle={loading ? "-" : maintenanceCount} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16}}>
          <div>
            <ButtonWithGradient onClick={() => setIsModalOpen(true)}>
              Add Maintenance Record
            </ButtonWithGradient>
          </div>
        </div>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Maintenance Record"
          onSubmit={handleSubmit}
          submitButtonText="Add"
        >
          <form>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <SelectInput
                  label="Vehicle *"
                  name="vehicleId"
                  value={form.vehicleId}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Select vehicle', value: '', disabled: true },
                    ...vehicles.map(v => ({
                      label: `${v.registrationNumber.toUpperCase()} (${v.make} ${v.model})`,
                      value: v.id
                    }))
                  ]}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormDateInput
                    label="Service Date *"
                    name="serviceDate"
                    value={form.serviceDate}
                    onChange={handleFormChange}
                    />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <SelectInput
                  label="Service Type *"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleFormChange}
                  options={[
                    { value: '', label: 'Select service type', disabled: true },
                    { label: "Regular Service", value: "Regular Service" },
                    { label: "Brake Service", value: "Brake Service" },
                    { label: "Engine Tune-up", value: "Engine Tune-up" },
                    { label: "Oil Change", value: "Oil Change" },
                    { label: "Tire Replacement", value: "Tire Replacement" },
                    { label: "Battery Replacement", value: "Battery Replacement" },
                    { label: "Other", value: "Other" }
                  ]}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <InputText
                  label="Cost *"
                  name="cost"
                  type="number"
                  value={form.cost}
                  placeholder="total service cost"
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <InputText
                  label="Odometer Reading Before *"
                  name="odometerReadingBefore"
                  placeholder="odometer reading before service"
                  type="number"
                  value={form.odometerReadingBefore}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
              <InputText
                  label="Odometer Reading After *"
                  name="odometerReadingAfter"
                  placeholder="odometer reading after service"
                  type="number"
                  value={form.odometerReadingAfter}
                  onChange={handleFormChange}
                />
              </div>
              {/* <div className="form-group" style={{ flex: 1 }}>
                <SelectInput
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  options={[
                    { value: '', label: 'Set status', disabled: true },
                    { label: "Scheduled", value: "Scheduled" },
                    { label: "Completed", value: "Completed" },
                    { label: "In Progress", value: "In Progress" }
                  ]}
                  required
                />
              </div> */}
            </div>
            <div className="form-group" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="">Upload image</label>
                <input type="file" name="" id="" accept="jpg/png" className="form-control" multiple />
              </div>
            </div>
            <div style={{ marginBottom: 0 }}>
              <TextAreaInput
                label="Description *"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="service description"
                required
              />
            </div>
            <ButtonWithGradient text="Add Record" onClick={handleSubmit}/>
          </form>
        </ReusableModal>
        <Table
          columns={[
            { key: "number", header: "#" },
            { key: "vehicleInfo", header: "Vehicle" },
            { key: "serviceDate", header: "Service Date" },
            { key: "serviceType", header: "Service Type" },
            { key: "cost", header: "Cost" },
            { key: "odometerReadingBefore", header: "Odometer Before" },
            { key: "odometerReadingAfter", header: "Odometer After" },
            { key: "description", header: "Description" },
          ]}
          data={maintenanceRecords.map((record, index) => {
            const vehicle = vehicles.find(v => v.id === record.vehicleId);
            return {
              ...record,
              number: index + 1,
              vehicleInfo: vehicle ? `${vehicle.registrationNumber.toUpperCase()} (${vehicle.make} ${vehicle.model})` : 'Unknown Vehicle',
              cost: `₹${record.cost.toLocaleString()}`,
              odometerReadingBefore: `${record.odometerReadingBefore.toLocaleString()} km`,
              odometerReadingAfter: `${record.odometerReadingAfter.toLocaleString()} km`,
            };
          })}
        />
      </PageContainer>
    </>
  );
};

export default VehicleMaintenance; 