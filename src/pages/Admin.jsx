import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Tabs, Tab, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure } from '@heroui/react';
import { Shield, ListCollapse, CheckCircle, XCircle, AlertTriangle, Edit3, Trash2, Plus } from 'lucide-react';
import { PharmoraEntityAPI } from '../../js/services/entity/entity.api.js';

export default function Admin() {
  const [entities, setEntities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('Course');

  const loadData = async () => {
    if (typeof PharmoraEntityAPI !== 'undefined') {
      const list = await PharmoraEntityAPI.listEntities().catch(() => []);
      setEntities(list);
      // Filter out items in DRAFT or pending review status
      setReviews(list.filter(e => e.status === 'DRAFT' || e.status === 'PENDING' || !e.status));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (entity) => {
    setSelectedEntity(entity);
    setFormName(entity.name);
    setFormDesc(entity.description || '');
    setFormType(entity.type);
    onOpen();
  };

  const handleCreateClick = () => {
    setSelectedEntity(null);
    setFormName('');
    setFormDesc('');
    setFormType('Course');
    onOpen();
  };

  const handleSave = async () => {
    if (typeof PharmoraEntityAPI === 'undefined') return;

    if (selectedEntity) {
      // Edit
      await PharmoraEntityAPI.updateEntity(selectedEntity.id, {
        ...selectedEntity,
        name: formName,
        description: formDesc,
        type: formType
      });
    } else {
      // Create new
      await PharmoraEntityAPI.createEntity({
        name: formName,
        description: formDesc,
        type: formType,
        status: 'PUBLISHED'
      });
    }
    loadData();
    onClose();
  };

  const handleReviewAction = async (entity, action) => {
    if (typeof PharmoraEntityAPI === 'undefined') return;
    const newStatus = action === 'approve' ? 'PUBLISHED' : action === 'reject' ? 'REJECTED' : 'NEEDS_CHANGES';
    await PharmoraEntityAPI.updateEntity(entity.id, { ...entity, status: newStatus });
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Shield className="w-8 h-8" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-text">Admin Workbench</h1>
            <p className="text-text-soft text-sm">Review content, moderate submissions, and manage entities.</p>
          </div>
        </div>
        <Button onClick={handleCreateClick} color="primary" startContent={<Plus className="w-4 h-4" />} className="font-bold">
          Create Entity
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs aria-label="Workbench Sections" color="primary" variant="underlined">
        {/* Overview Tab */}
        <Tab key="overview" title="Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="bg-surface border border-border p-6 text-left">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Entities</h3>
              <p className="text-3xl font-black text-text mt-2">{entities.length}</p>
            </Card>
            <Card className="bg-surface border border-border p-6 text-left">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending Review</h3>
              <p className="text-3xl font-black text-warning mt-2">{reviews.length}</p>
            </Card>
            <Card className="bg-surface border border-border p-6 text-left">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Active System Checks</h3>
              <p className="text-3xl font-black text-success mt-2">100% OK</p>
            </Card>
          </div>
        </Tab>

        {/* Review Queue Tab */}
        <Tab key="reviews" title={`Review Queue (${reviews.length})`}>
          <div className="mt-6">
            <Table aria-label="Submissions queue">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {reviews.length > 0 ? (
                  reviews.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-left">{item.name}</TableCell>
                      <TableCell className="text-left">{item.type}</TableCell>
                      <TableCell className="text-left">
                        <span className="text-xs font-bold bg-warning/10 text-warning px-2.5 py-1 rounded-full">
                          {item.status || 'PENDING'}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button onClick={() => handleReviewAction(item, 'approve')} size="xs" color="success" startContent={<CheckCircle className="w-3.5 h-3.5" />} className="font-bold text-xs">
                          Approve
                        </Button>
                        <Button onClick={() => handleReviewAction(item, 'reject')} size="xs" color="danger" startContent={<XCircle className="w-3.5 h-3.5" />} className="font-bold text-xs">
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-text-soft">
                      No pending reviews found in queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>

        {/* Entity Manager Tab */}
        <Tab key="manager" title="Entity Manager">
          <div className="mt-6">
            <Table aria-label="Entity Manager catalog">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn className="text-right">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {entities.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-left">{item.name}</TableCell>
                    <TableCell className="text-left">{item.type}</TableCell>
                    <TableCell className="text-left">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.status === 'PUBLISHED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {item.status || 'PUBLISHED'}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button onClick={() => handleEditClick(item)} size="xs" variant="flat" startContent={<Edit3 className="w-3.5 h-3.5" />} className="font-bold text-xs">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      {/* Creation / Edit Modal Dialog */}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader className="font-extrabold">{selectedEntity ? 'Edit Entity' : 'Create New Entity'}</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <Input
              label="Entity Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. B.Pharm Semester 1"
            />
            <Textarea
              label="Description"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Provide a detailed description of the subject or course syllabus..."
            />
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-semibold text-text-soft">Entity Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-sm text-text"
              >
                <option value="Course">Course</option>
                <option value="Resource">Resource</option>
                <option value="MCQ">MCQ</option>
              </select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onClose} className="font-bold">
              Cancel
            </Button>
            <Button color="primary" onClick={handleSave} className="font-bold">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
