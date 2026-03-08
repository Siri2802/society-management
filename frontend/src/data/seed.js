// ── Seed data for Green Valley Society ──────────────────────────────────────

export const USERS = [
  { id: 'u1', name: 'Admin Kumar', email: 'admin@greenvalley.in', password: 'admin123', role: 'management', unit: 'Office', phone: '+91 98765 00001', avatar: 'AK', verified: true },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@resident.in', password: 'resident123', role: 'resident', unit: 'A-401', phone: '+91 98765 00002', avatar: 'PS', verified: true },
  { id: 'u3', name: 'Rajan Patel', email: 'rajan@resident.in', password: 'resident123', role: 'resident', unit: 'B-201', phone: '+91 98765 00003', avatar: 'RP', verified: true },
  { id: 'u4', name: 'Suresh Nair', email: 'staff@greenvalley.in', password: 'staff123', role: 'staff', unit: 'Staff Quarters', phone: '+91 98765 00004', avatar: 'SN', verified: true },
  { id: 'u5', name: 'Meera Iyer', email: 'meera@resident.in', password: 'resident123', role: 'resident', unit: 'C-101', phone: '+91 98765 00005', avatar: 'MI', verified: true },
  { id: 'u6', name: 'Deepak Singh', email: 'deepak@resident.in', password: 'resident123', role: 'resident', unit: 'A-202', phone: '+91 98765 00006', avatar: 'DS', verified: true },
];

export const UNITS = [
  { id: 'unit-1', number: 'A-101', block: 'A', floor: 1, type: '2BHK', owner: 'Arjun Mehta', resident: null, status: 'vacant' },
  { id: 'unit-2', number: 'A-202', block: 'A', floor: 2, type: '3BHK', owner: 'Deepak Singh', resident: 'u6', status: 'occupied' },
  { id: 'unit-3', number: 'A-401', block: 'A', floor: 4, type: '3BHK', owner: 'Priya Sharma', resident: 'u2', status: 'occupied' },
  { id: 'unit-4', number: 'B-201', block: 'B', floor: 2, type: '2BHK', owner: 'Rajan Patel', resident: 'u3', status: 'occupied' },
  { id: 'unit-5', number: 'B-302', block: 'B', floor: 3, type: '1BHK', owner: 'Kavita Rao', resident: null, status: 'vacant' },
  { id: 'unit-6', number: 'C-101', block: 'C', floor: 1, type: '2BHK', owner: 'Meera Iyer', resident: 'u5', status: 'occupied' },
  { id: 'unit-7', number: 'C-202', block: 'C', floor: 2, type: '3BHK', owner: 'Santosh Gupta', resident: 'u7', status: 'occupied' },
  { id: 'unit-8', number: 'D-103', block: 'D', floor: 1, type: '4BHK', owner: 'Pradeep Joshi', resident: null, status: 'under-renovation' },
];

export const VISITORS = [
  { id: 'v1', name: 'Ankit Verma', phone: '9876543210', hostUnit: 'A-401', hostName: 'Priya Sharma', purpose: 'Personal Visit', vehicleNo: 'MH01AB1234', status: 'inside', checkIn: '2024-01-15T10:30:00', checkOut: null, preApproved: true, approvedBy: 'u2' },
  { id: 'v2', name: 'Flipkart Delivery', phone: '9988776655', hostUnit: 'B-201', hostName: 'Rajan Patel', purpose: 'Delivery', vehicleNo: 'MH02XY5678', status: 'exited', checkIn: '2024-01-15T11:00:00', checkOut: '2024-01-15T11:15:00', preApproved: false, approvedBy: null },
  { id: 'v3', name: 'Dr. Nisha Kapoor', phone: '9876500000', hostUnit: 'C-101', hostName: 'Meera Iyer', purpose: 'Medical Visit', vehicleNo: null, status: 'pre-approved', checkIn: null, checkOut: null, preApproved: true, approvedBy: 'u5' },
  { id: 'v4', name: 'Rakesh Carpenter', phone: '9812345678', hostUnit: 'A-202', hostName: 'Deepak Singh', purpose: 'Maintenance Work', vehicleNo: null, status: 'exited', checkIn: '2024-01-14T09:00:00', checkOut: '2024-01-14T13:30:00', preApproved: true, approvedBy: 'u6' },
  { id: 'v5', name: 'Ramesh Sharma', phone: '9876541230', hostUnit: 'A-401', hostName: 'Priya Sharma', purpose: 'Relative Visit', vehicleNo: 'DL3CAB0001', status: 'exited', checkIn: '2024-01-13T16:00:00', checkOut: '2024-01-13T20:00:00', preApproved: true, approvedBy: 'u2' },
];

export const MAINTENANCE_REQUESTS = [
  { id: 'mr1', title: 'Leaking kitchen tap', description: 'The kitchen tap has been leaking for 2 days. Water is wasting continuously.', category: 'Plumbing', unit: 'A-401', residentId: 'u2', residentName: 'Priya Sharma', status: 'in-progress', priority: 'high', assignedTo: 'u4', assignedName: 'Suresh Nair', createdAt: '2024-01-13T08:00:00', updatedAt: '2024-01-14T10:00:00', rating: null, workLog: [{ time: '2024-01-13T09:00:00', note: 'Assigned to Suresh Nair' }, { time: '2024-01-14T10:00:00', note: 'Parts ordered, will fix tomorrow' }] },
  { id: 'mr2', title: 'Power outage in bedroom', description: 'No electricity in the master bedroom. Circuit breaker tripped.', category: 'Electrical', unit: 'B-201', residentId: 'u3', residentName: 'Rajan Patel', status: 'resolved', priority: 'urgent', assignedTo: 'u4', assignedName: 'Suresh Nair', createdAt: '2024-01-12T14:00:00', updatedAt: '2024-01-12T16:30:00', rating: 5, workLog: [{ time: '2024-01-12T14:30:00', note: 'Assigned to Suresh Nair' }, { time: '2024-01-12T16:30:00', note: 'Fixed - replaced faulty breaker' }] },
  { id: 'mr3', title: 'Broken lobby light', description: 'The light at B-block lobby entrance is broken. Security concern at night.', category: 'Common Area', unit: 'B-Block', residentId: 'u3', residentName: 'Rajan Patel', status: 'open', priority: 'medium', assignedTo: null, assignedName: null, createdAt: '2024-01-15T07:00:00', updatedAt: '2024-01-15T07:00:00', rating: null, workLog: [] },
  { id: 'mr4', title: 'AC not cooling', description: 'Air conditioner in living room stopped cooling. Gas refill needed maybe.', category: 'HVAC', unit: 'C-101', residentId: 'u5', residentName: 'Meera Iyer', status: 'open', priority: 'low', assignedTo: null, assignedName: null, createdAt: '2024-01-15T09:30:00', updatedAt: '2024-01-15T09:30:00', rating: null, workLog: [] },
  { id: 'mr5', title: 'Elevator stuck on 3rd floor', description: 'B-block elevator is stuck and doors not opening. Urgent fix needed.', category: 'Elevator', unit: 'B-Block', residentId: 'u3', residentName: 'Rajan Patel', status: 'resolved', priority: 'urgent', assignedTo: 'u4', assignedName: 'Suresh Nair', createdAt: '2024-01-10T10:00:00', updatedAt: '2024-01-10T12:00:00', rating: 4, workLog: [{ time: '2024-01-10T10:30:00', note: 'Technician called' }, { time: '2024-01-10T12:00:00', note: 'Fixed and tested' }] },
];

export const BILLS = [
  { id: 'b1', unit: 'A-401', residentName: 'Priya Sharma', month: 'January 2024', maintenance: 3000, water: 500, parking: 1000, penalty: 0, total: 4500, status: 'paid', paidOn: '2024-01-05', txnId: 'TXN2024010001', receipt: true },
  { id: 'b2', unit: 'B-201', residentName: 'Rajan Patel', month: 'January 2024', maintenance: 2500, water: 400, parking: 0, penalty: 0, total: 2900, status: 'pending', paidOn: null, txnId: null, receipt: false },
  { id: 'b3', unit: 'C-101', residentName: 'Meera Iyer', month: 'January 2024', maintenance: 2500, water: 350, parking: 500, penalty: 0, total: 3350, status: 'overdue', paidOn: null, txnId: null, receipt: false },
  { id: 'b4', unit: 'A-202', residentName: 'Deepak Singh', month: 'January 2024', maintenance: 3000, water: 450, parking: 1000, penalty: 300, total: 4750, status: 'paid', paidOn: '2024-01-08', txnId: 'TXN2024010002', receipt: true },
  { id: 'b5', unit: 'A-401', residentName: 'Priya Sharma', month: 'December 2023', maintenance: 3000, water: 480, parking: 1000, penalty: 0, total: 4480, status: 'paid', paidOn: '2023-12-04', txnId: 'TXN2023120001', receipt: true },
  { id: 'b6', unit: 'B-201', residentName: 'Rajan Patel', month: 'December 2023', maintenance: 2500, water: 390, parking: 0, penalty: 0, total: 2890, status: 'paid', paidOn: '2023-12-07', txnId: 'TXN2023120002', receipt: true },
];

export const ANNOUNCEMENTS = [
  { id: 'an1', title: 'Water Supply Interruption – Jan 17', body: 'Water supply will be interrupted on January 17th from 9 AM to 2 PM for pipeline maintenance work. Please store water accordingly. We apologize for the inconvenience.', category: 'maintenance', priority: 'high', postedBy: 'Admin Kumar', postedAt: '2024-01-15T08:00:00', pinned: true, views: 42 },
  { id: 'an2', title: 'Annual General Meeting – Jan 20', body: 'The Annual General Meeting is scheduled for January 20, 2024 at 5:00 PM in the clubhouse. All residents are requested to attend. Agenda: 2023 audit, 2024 budget, committee elections.', category: 'event', priority: 'medium', postedBy: 'Admin Kumar', postedAt: '2024-01-14T10:00:00', pinned: true, views: 67 },
  { id: 'an3', title: 'New Parking Allocation Policy', body: 'Effective February 1st, visitor parking will be limited to 4 hours per visit. Residents must register vehicles at the office. Towing charges will apply for violations.', category: 'policy', priority: 'medium', postedBy: 'Admin Kumar', postedAt: '2024-01-12T09:00:00', pinned: false, views: 89 },
  { id: 'an4', title: 'Holi Celebration – March 25', body: 'Green Valley Society celebrates Holi on March 25th at the main garden. Colors, music, and food for everyone. Families are welcome. Event starts at 10 AM.', category: 'event', priority: 'low', postedBy: 'Admin Kumar', postedAt: '2024-01-10T11:00:00', pinned: false, views: 103 },
];

export const FORUM_POSTS = [
  { id: 'fp1', title: 'Can we get speed bumps near the kids play area?', body: 'Cars drive too fast near the children play area. Can management install speed bumps or at least signage?', postedBy: 'Priya Sharma', postedByUnit: 'A-401', postedAt: '2024-01-14T19:00:00', likes: 14, replies: [{ id: 'r1', text: 'Fully agree! Nearly had an incident last week.', by: 'Meera Iyer', unit: 'C-101', at: '2024-01-14T20:00:00' }, { id: 'r2', text: 'We will look into this – Management', by: 'Admin Kumar', unit: 'Office', at: '2024-01-15T09:00:00' }], tags: ['safety', 'children'] },
  { id: 'fp2', title: 'Recommend plumber for bathroom renovation?', body: 'Looking for a trusted plumber for a full bathroom renovation. Any residents with positive experience please share contact.', postedBy: 'Rajan Patel', postedByUnit: 'B-201', postedAt: '2024-01-13T11:00:00', likes: 5, replies: [{ id: 'r3', text: 'Rajesh Plumbing Works – 9876543210, very reliable.', by: 'Deepak Singh', unit: 'A-202', at: '2024-01-13T12:00:00' }], tags: ['recommendation', 'renovation'] },
  { id: 'fp3', title: 'Lost: Black labrador puppy near D-block', body: 'Our puppy Bruno went missing near D-block garden area this morning. Black lab, 6 months old, wearing a red collar. Please call 9988001122 if found.', postedBy: 'Meera Iyer', postedByUnit: 'C-101', postedAt: '2024-01-15T07:30:00', likes: 22, replies: [], tags: ['lost', 'urgent'] },
];

export const NOTIFICATIONS = [
  { id: 'n1', type: 'bill', message: 'Your January 2024 maintenance bill of ₹4,500 is due.', time: '2024-01-15T08:00:00', read: false, userId: 'u2' },
  { id: 'n2', type: 'maintenance', message: 'Your request "Leaking kitchen tap" has been assigned to Suresh Nair.', time: '2024-01-14T10:00:00', read: false, userId: 'u2' },
  { id: 'n3', type: 'visitor', message: 'Dr. Nisha Kapoor has been pre-approved for tomorrow.', time: '2024-01-14T15:00:00', read: true, userId: 'u5' },
  { id: 'n4', type: 'announcement', message: 'New announcement: Water Supply Interruption – Jan 17', time: '2024-01-15T08:00:00', read: false, userId: 'u3' },
  { id: 'n5', type: 'maintenance', message: 'New maintenance request "Broken lobby light" submitted.', time: '2024-01-15T07:00:00', read: false, userId: 'u4' },
];

export const SYSTEM_STATS = {
  totalUnits: 8,
  occupiedUnits: 5,
  totalResidents: 6,
  totalStaff: 1,
  openMaintenance: 2,
  pendingBills: 2,
  visitorsToday: 3,
  collectionRate: 62.5,
};
