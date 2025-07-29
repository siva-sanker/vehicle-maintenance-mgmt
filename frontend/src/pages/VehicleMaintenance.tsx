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
import { formatDateDDMMYYYY } from '../utils/vehicleUtils';

const VehicleMaintenance: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: "",
    date: "",
    description: "",
    cost: "",
    status: "Scheduled"
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<Maintenance | null>(null);
  const [showRestoreMaintenanceModal, setShowRestoreMaintenanceModal] = useState(false);
  const [deletedMaintenance, setDeletedMaintenance] = useState<Maintenance[]>([]);
  const [restoreMaintenanceLoading, setRestoreMaintenanceLoading] = useState(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

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

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };
  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };

  // Simple form validation to prevent null/empty values
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for null/empty required fields
    if (!form.vehicle_id || form.vehicle_id.trim() === '') {
      errors.push('Vehicle is required');
    }

    if (!form.date || form.date.trim() === '') {
      errors.push('Service date is required');
    }

    if (!form.description || form.description.trim() === '') {
      errors.push('Description is required');
    }

    if (!form.cost || form.cost.trim() === '') {
      errors.push('Cost is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      vehicle_id: "",
      date: "",
      description: "",
      cost: "",
      status: "Scheduled"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: Maintenance) => {
    setEditingRecord(record);
    setForm({
      vehicle_id: record.vehicle_id,
      date: record.date,
      description: record.description,
      cost: record.cost.toString(),
      status: record.status || "Scheduled"
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
        vehicle_id: form.vehicle_id,
        date: form.date,
        description: form.description,
        cost: parseFloat(form.cost),
        status: form.status || "Scheduled"
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
        vehicle_id: "",
        date: "",
        description: "",
        cost: "",
        status: "Scheduled"
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
      await maintenanceAPI.deleteMaintenance(id);
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
      setDeletedMaintenance(all.filter(m => m.deleted_at));
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
      await maintenanceAPI.updateMaintenance(id, { deleted_at: null });
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
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <Cards title="Total Active Vehicles" subtitle={loading ? "-" : activeCount} />
          <Cards title="Vehicles in Maintenance" subtitle={loading ? "-" : maintenanceCount} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5}}>
          <div style={{display:'flex',gap:'15px'}}>
            <FormDateInput name="fromDate" label="From Date" value={fromDate} onChange={handleFromDateChange}/>
            <FormDateInput name="toDate" label="To Date" value={toDate} onChange={handleToDateChange}/>
          </div>
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
                  name="vehicle_id"
                  value={form.vehicle_id}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Select vehicle', value: '', disabled: true },
                    ...vehicles.map(v => ({
                      label: `${v.registration_number.toUpperCase()} (${v.make} ${v.model})`,
                      value: v.id
                    }))
                  ]}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormDateInput
                    label="Service Date *"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
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
                  placeholder="Total service cost"
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectInput
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  options={[
                    { label: 'Set status', value: '', disabled: true },
                    { label: "Scheduled", value: "Scheduled" },
                    { label: "Completed", value: "Completed" },
                    { label: "In Progress", value: "In Progress" }
                  ]}
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <TextAreaInput
                label="Description *"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Service description"
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
                      const vehicle = vehicles.find(v => v.id === row.vehicle_id);
                      return vehicle ? `${vehicle.registration_number.toUpperCase()}` : 'Unknown Vehicle';
                  }},
                  { key: 'date', header: 'Service Date' },
                  { key: 'description', header: 'Description' },
                  { key: 'cost', header: 'Cost', renderCell: (cost: number) => `₹${cost.toLocaleString()}` },
                  { key: 'status', header: 'Status' },
                  { key: 'actions', header: 'Actions', renderCell: (id: string) => (
                    <ButtonWithGradient onClick={() => handleRestoreMaintenance(id)} text="Restore" className="btn-success" />
                  ) }
                ]}
                data={deletedMaintenance.map(m => ({
                  ...m,
                  vehicleInfo: m.vehicle_id, // needed for Table to pass row to renderCell
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
            { key: "date", header: "Service Date", renderCell: (value) => formatDateDDMMYYYY(value) },
            { key: "description", header: "Description" },
            { key: "cost", header: "Cost" ,
              renderCell: (cost) => `₹${cost.toLocaleString()}`
            },
            { key: "status", header: "Status" },
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
            .filter(record => {
              if (record.deleted_at) return false;
              let matchesFrom = true;
              let matchesTo = true;
              if (fromDate) {
                matchesFrom = record.date >= fromDate;
              }
              if (toDate) {
                matchesTo = record.date <= toDate;
              }
              return matchesFrom && matchesTo;
            })
            .map((record, index) => {
              const vehicle = vehicles.find(v => v.id === record.vehicle_id);
              return {
                ...record,
                number: index + 1,
                vehicleInfo: vehicle ? `${vehicle.registration_number.toUpperCase()} (${vehicle.make} ${vehicle.model})` : 'Unknown Vehicle'
              };
            })}
        />
      </PageContainer>
    </>
  );
};

export default VehicleMaintenance; 