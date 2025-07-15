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
import EditButton from "../components/EditButton";
import DeleteButton from "../components/DeleteButton";
import RestoreButton from '../components/RestoreButton';
import { vehicleAPI, Vehicle, maintenanceAPI, Maintenance } from "../services/api";

const VehicleMaintenance: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: "",
    serviceDate: "",
    serviceType: "",
    descriptionBefore: "",
    descriptionAfter: "",
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
  const [editingRecord, setEditingRecord] = useState<Maintenance | null>(null);
  const [showRestoreMaintenanceModal, setShowRestoreMaintenanceModal] = useState(false);
  const [deletedMaintenance, setDeletedMaintenance] = useState<Maintenance[]>([]);
  const [restoreMaintenanceLoading, setRestoreMaintenanceLoading] = useState(false);

  // for cards
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
        // Only fetch non-deleted maintenance records
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

    if (!form.descriptionBefore || form.descriptionBefore.trim() === '') {
      errors.push('Description Before Maintenance is required');
    }
    if (!form.descriptionAfter || form.descriptionAfter.trim() === '') {
      errors.push('Description Afetr Maintenance is required');
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

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      vehicleId: "",
      serviceDate: "",
      serviceType: "",
      descriptionBefore: "",
      descriptionAfter: "",
      cost: "",
      nextServiceDate: "",
      serviceCenter: "",
      technician: "",
      status: "Scheduled",
      odometerReadingBefore: "",
      odometerReadingAfter: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: Maintenance) => {
    setEditingRecord(record);
    setForm({
      vehicleId: record.vehicleId,
      serviceDate: record.serviceDate,
      serviceType: record.serviceType,
      descriptionBefore: record.descriptionBefore, // Only one description field exists
      descriptionAfter: record.descriptionAfter, // Use same for both
      cost: record.cost.toString(),
      nextServiceDate: "",
      serviceCenter: "",
      technician: "",
      status: record.status || "Scheduled",
      odometerReadingBefore: record.odometerReadingBefore?.toString() || "",
      odometerReadingAfter: record.odometerReadingAfter?.toString() || ""
    });
    setIsModalOpen(true);
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
        descriptionBefore: form.descriptionBefore,
        descriptionAfter: form.descriptionAfter,
        cost: parseFloat(form.cost),
        status: "Completed",
        odometerReadingBefore: parseFloat(form.odometerReadingBefore) || 0,
        odometerReadingAfter: parseFloat(form.odometerReadingAfter) || 0,
        serviceCenter: "Auto Service Center",
        technician: "Technician",
        deleted: false
      };

      if (editingRecord) {
        await maintenanceAPI.updateMaintenance(editingRecord.id, maintenanceData);
        toast.success('Maintenance record updated successfully!');
      } else {
        await maintenanceAPI.createMaintenance(maintenanceData);
        toast.success('Maintenance record added successfully!');
      }
      // Refresh maintenance records
      const updatedRecords = await maintenanceAPI.getAllMaintenance();
      setMaintenanceRecords(updatedRecords);
      // Reset form
      setForm({
        vehicleId: "",
        serviceDate: "",
        serviceType: "",
        descriptionBefore: "",
        descriptionAfter: "",
        cost: "",
        nextServiceDate: "",
        serviceCenter: "",
        technician: "",
        status: "Scheduled",
        odometerReadingBefore: "",
        odometerReadingAfter: ""
      });
      setEditingRecord(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving maintenance record:', error);
      toast.error('Failed to save maintenance record. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record? This action can be undone by an administrator.')) return;
    try {
      await maintenanceAPI.updateMaintenance(id, { deleted: true });
      toast.success('Record deleted');
      const updatedRecords = await maintenanceAPI.getAllMaintenance();
      setMaintenanceRecords(updatedRecords);
    } catch {
      toast.error('Failed to delete record');
    }
  };

  const fetchDeletedMaintenance = async () => {
    setRestoreMaintenanceLoading(true);
    try {
      const all = await maintenanceAPI.getAllMaintenance();
      setDeletedMaintenance(all.filter(m => m.deleted));
    } catch {
      setDeletedMaintenance([]);
    } finally {
      setRestoreMaintenanceLoading(false);
    }
  };

  const handleOpenRestoreMaintenanceModal = async () => {
    await fetchDeletedMaintenance();
    setShowRestoreMaintenanceModal(true);
  };

  const handleRestoreMaintenance = async (id: string) => {
    if (!window.confirm('Are you sure you want to restore this maintenance record?')) return;
    setRestoreMaintenanceLoading(true);
    try {
      toast.success('Maintenance record restored successfully');
      await maintenanceAPI.updateMaintenance(id, { deleted: false });
      await fetchDeletedMaintenance();
      const updatedRecords = await maintenanceAPI.getAllMaintenance();
      setMaintenanceRecords(updatedRecords);
    } catch {
      toast.error('Failed to restore maintenance record');
    } finally {
      setRestoreMaintenanceLoading(false);
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
          <div style={{ display: 'flex', gap: 8 }}>
            <ButtonWithGradient onClick={openAddModal}>
              Add Maintenance Record
            </ButtonWithGradient>
            <RestoreButton onClick={handleOpenRestoreMaintenanceModal} text="Restore Deleted Maintenance" />
          </div>
        </div>
        <ReusableModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingRecord(null); }}
          title={editingRecord ? "Edit Maintenance Record" : "Add Maintenance Record"}
          onSubmit={handleSubmit}
          submitButtonText={editingRecord ? "Update" : "Add"}
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
              <div style={{ flex: 1 }}>
                <label htmlFor="">Upload image</label>
                <input type="file" name="" id="" accept="jpg/png" className="form-control" multiple />
              </div>
              {/* <div className="form-group" style={{ flex: 1 }}>
                <SelectInput
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Set status',value: '', disabled: true},
                    { label: "Scheduled", value: "Scheduled" },
                    { label: "Completed", value: "Completed" },
                    { label: "In Progress", value: "In Progress" }
                    ]}
                    required
                    />
              </div> */}
            </div>
            <div className="form-group" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div className="form-group" style={{flex:1}}>
                      <TextAreaInput
                        label="Description Before Maintenance *"
                        name="descriptionBefore"
                        value={form.descriptionBefore}
                        onChange={handleFormChange}
                        placeholder="service description before maintenance"
                        required
                      />
                    </div>
            </div>
            <div style={{ marginBottom: 0 }}>
              <TextAreaInput
                label="Description After Maintenance *"
                name="descriptionAfter"
                value={form.descriptionAfter}
                onChange={handleFormChange}
                placeholder="service description after maintenance"
                required
              />
            </div>
            <ButtonWithGradient text="Add Record" onClick={handleSubmit}/>
          </form>
        </ReusableModal>

        <ReusableModal
          isOpen={showRestoreMaintenanceModal}
          onClose={() => setShowRestoreMaintenanceModal(false)}
          title="Restore Deleted Maintenance Records"
          onSubmit={() => setShowRestoreMaintenanceModal(false)}
          submitButtonText="Close"
          showCancelButton={false}
          maxWidth="900px"
          maxHeight="80vh"
        >
          {restoreMaintenanceLoading ? (
            <div>Loading deleted maintenance records...</div>
          ) : deletedMaintenance.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No deleted maintenance records found</h3>
            </div>
          ) : (
            <div className="table-container" style={{width:'100%'}}>
              <Table
                columns={[
                  { key: 'vehicleInfo', header: 'Vehicle', renderCell: (_: any, row: any) => {
                      const vehicle = vehicles.find(v => v.id === row.vehicleId);
                      return vehicle ? `${vehicle.registrationNumber.toUpperCase()}` : 'Unknown Vehicle';
                  }},
                  { key: 'serviceDate', header: 'Service Date' },
                  // { key: 'serviceType', header: 'Service Type' },
                  { key: 'cost', header: 'Cost', renderCell: (cost: number) => `₹${cost.toLocaleString()}` },
                  { key: 'odometerReadingBefore', header: 'Odometer Before', renderCell: (v: number) => `${v.toLocaleString()} km` },
                  { key: 'odometerReadingAfter', header: 'Odometer After', renderCell: (v: number) => `${v.toLocaleString()} km` },
                  { key: 'actions', header: 'Actions', renderCell: (id: string) => (
                    <ButtonWithGradient onClick={() => handleRestoreMaintenance(id)} text="Restore" className="btn-success" />
                  ) }
                ]}
                data={deletedMaintenance.map(m => ({
                  ...m,
                  vehicleInfo: m.vehicleId, // needed for Table to pass row to renderCell
                  actions: m.id
                }))}
              />
            </div>
          )}
        </ReusableModal>
        <Table
          columns={[
            { key: "number", header: "#" },
            { key: "vehicleInfo", header: "Vehicle" },
            { key: "serviceDate", header: "Service Date" },
            { key: "serviceType", header: "Service Type" },
            { key: "cost", header: "Cost" ,
              renderCell: (cost) => `₹${cost.toLocaleString()}`
            },
            { key: "odometerReadingBefore", header: "Odometer Before",
              renderCell: (odometerReadingBefore) => `${odometerReadingBefore.toLocaleString()} km`
             },
            { key: "odometerReadingAfter", header: "Odometer After",
              renderCell: (odometerReadingAfter) => `${odometerReadingAfter.toLocaleString()} km`
             },
            { key: "descriptionBefore", header: "Description Before" },
            { key: "descriptionAfter", header: "Description After" },
            { key: "actions", header: "Actions",
              renderCell: (_: any, row: any) => (
                <div style={{display:"flex",gap:'10px'}}>
                  <EditButton onClick={() => openEditModal(row)} />
                  <DeleteButton onClick={() => handleDelete(row.id)} />
                </div>
              )
            }
          ]}
          data={maintenanceRecords
            .filter(record => !record.deleted)
            .map((record, index) => {
              const vehicle = vehicles.find(v => v.id === record.vehicleId);
              return {
                ...record,
                number: index + 1,
                vehicleInfo: vehicle ? `${vehicle.registrationNumber.toUpperCase()} (${vehicle.make} ${vehicle.model})` : 'Unknown Vehicle',
                descriptionBefore: record.descriptionBefore,
                descriptionAfter: record.descriptionAfter
              };
            })}
        />
      </PageContainer>
    </>
  );
};

export default VehicleMaintenance; 