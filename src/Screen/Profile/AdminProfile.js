// screens/Admin/AdminUserManagement.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  Chip,
  Searchbar,
  Menu,
  Divider,
  Portal,
  Dialog
} from 'react-native-paper';
import {
  Users,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Eye,
  Shield,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react-native';
import Header from '../../Components/layout/Header';
import axiosInstance from '../../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const THEME = '#C21807';
const THEME_LIGHT = '#FFE4E1';

export default function AdminUserManagement({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    isVerified: '',
    isApproved: '',
    paymentStatus: '',
    isDeleted: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [stats, setStats] = useState(null);

  // Form states
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    emailDesignation: ''
  });

  const [roleForm, setRoleForm] = useState({
    role: 'user'
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: false,
    transactionId: '',
    amount: ''
  });

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    userId: null,
    userName: '',
    permanent: false
  });

  // Approve confirmation
  const [approveDialog, setApproveDialog] = useState({
    visible: false,
    userId: null,
    userName: '',
    currentStatus: false
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.isVerified !== '' && { isVerified: filters.isVerified }),
        ...(filters.isApproved !== '' && { isApproved: filters.isApproved }),
        ...(filters.paymentStatus !== '' && { paymentStatus: filters.paymentStatus }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await axiosInstance.get(`/getallusers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.pagination.totalUsers,
          totalPages: response.data.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.get('/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination({ ...pagination, page: 1 });
    setTimeout(() => {
      fetchUsers();
    }, 500);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      isVerified: '',
      isApproved: '',
      paymentStatus: '',
      isDeleted: false
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleApproveToggle = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const newStatus = !approveDialog.currentStatus;
      
      const response = await axiosInstance.put(
        `/users/${approveDialog.userId}/approve`,
        { isApproved: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          `User ${newStatus ? 'approved' : 'unapproved'} successfully`
        );
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Approve error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update approval status');
    } finally {
      setLoading(false);
      setApproveDialog({ visible: false, userId: null, userName: '', currentStatus: false });
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const endpoint = deleteDialog.permanent 
        ? `/users/${deleteDialog.userId}/permanent`
        : `/users/${deleteDialog.userId}/temp`;

      const response = await axiosInstance.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        data: deleteDialog.permanent ? {} : { deletionReason: 'Admin deleted' }
      });

      if (response.data.success) {
        Alert.alert(
          'Success',
          `User ${deleteDialog.permanent ? 'permanently deleted' : 'temporarily deleted'} successfully`
        );
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete user');
    } finally {
      setLoading(false);
      setDeleteDialog({ visible: false, userId: null, userName: '', permanent: false });
    }
  };

  const handleRestore = async (userId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.post(`/users/${userId}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        Alert.alert('Success', 'User restored successfully');
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.put(
        `/users/${selectedUser._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'User updated successfully');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.put(
        `/users/${selectedUser._id}/role`,
        { role: roleForm.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Role updated successfully');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Role update error:', error);
      Alert.alert('Error', 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axiosInstance.put(
        `/users/${selectedUser._id}/payment-status`,
        {
          paymentStatus: paymentForm.paymentStatus,
          transactionId: paymentForm.transactionId,
          amount: paymentForm.amount
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Payment status updated successfully');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Payment update error:', error);
      Alert.alert('Error', 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      emailDesignation: user.emailDesignation || ''
    });
    setModalType('edit');
    setModalVisible(true);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setRoleForm({ role: user.role });
    setModalType('role');
    setModalVisible(true);
  };

  const openPaymentModal = (user) => {
    setSelectedUser(user);
    setPaymentForm({
      paymentStatus: user.paymentStatus || false,
      transactionId: user.lastTransactionId || '',
      amount: user.lastPaymentAmount ? String(user.lastPaymentAmount) : ''
    });
    setModalType('payment');
    setModalVisible(true);
  };

  const renderStats = () => {
    if (!stats) return null;
    
    const statsCards = [
      {
        title: 'Total Users',
        value: stats.overallStats?.totalUsers || 0,
        icon: Users,
        color: '#3B82F6'
      },
      {
        title: 'Pending Approval',
        value: (stats.overallStats?.totalUsers || 0) - (stats.overallStats?.verifiedUsers || 0),
        icon: UserX,
        color: '#F59E0B'
      },
      {
        title: 'Approved',
        value: stats.overallStats?.verifiedUsers || 0,
        icon: UserCheck,
        color: '#10B981'
      },
      {
        title: 'Paid Users',
        value: stats.overallStats?.paidUsers || 0,
        icon: CreditCard,
        color: '#8B5CF6'
      }
    ];

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        {statsCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <stat.icon size={24} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.role && (
          <Chip
            style={styles.filterChip}
            onClose={() => setFilters({ ...filters, role: '' })}
          >
            Role: {filters.role}
          </Chip>
        )}
        {filters.isApproved !== '' && (
          <Chip
            style={styles.filterChip}
            onClose={() => setFilters({ ...filters, isApproved: '' })}
          >
            {filters.isApproved === 'true' ? 'Approved' : 'Unapproved'}
          </Chip>
        )}
        {filters.paymentStatus !== '' && (
          <Chip
            style={styles.filterChip}
            onClose={() => setFilters({ ...filters, paymentStatus: '' })}
          >
            {filters.paymentStatus === 'true' ? 'Paid' : 'Unpaid'}
          </Chip>
        )}
        {(filters.role || filters.isApproved !== '' || filters.paymentStatus !== '') && (
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  const renderUserCard = ({ item }) => (
    <Card style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userMobile}>+91 {item.mobile}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            {item.isApproved ? (
              <View style={[styles.statusBadge, styles.approvedBadge]}>
                <CheckCircle size={12} color="#10B981" />
                <Text style={styles.approvedText}>Approved</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, styles.pendingBadge]}>
                <XCircle size={12} color="#F59E0B" />
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
            
            <Chip style={styles.roleChip} textStyle={styles.roleText}>
              {item.role}
            </Chip>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verified:</Text>
            <Text style={styles.detailValue}>
              {item.isVerified ? '✅' : '❌'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment:</Text>
            <Text style={[
              styles.detailValue,
              item.paymentStatus ? styles.paidText : styles.unpaidText
            ]}>
              {item.paymentStatus ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Joined:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <IconButton
            icon={() => <Eye size={18} color={THEME} />}
            onPress={() => openViewModal(item)}
            size={24}
          />
          <IconButton
            icon={() => <Edit size={18} color={THEME} />}
            onPress={() => openEditModal(item)}
            size={24}
          />
          <IconButton
            icon={() => <Shield size={18} color={THEME} />}
            onPress={() => openRoleModal(item)}
            size={24}
          />
          <IconButton
            icon={() => <CreditCard size={18} color={THEME} />}
            onPress={() => openPaymentModal(item)}
            size={24}
          />
          {item.isDeleted ? (
            <IconButton
              icon={() => <RefreshCw size={18} color={THEME} />}
              onPress={() => handleRestore(item._id)}
              size={24}
            />
          ) : (
            <IconButton
              icon={() => <Trash2 size={18} color={THEME} />}
              onPress={() => setDeleteDialog({
                visible: true,
                userId: item._id,
                userName: `${item.firstName} ${item.lastName}`,
                permanent: false
              })}
              size={24}
            />
          )}
        </View>

        {!item.isApproved && item.isVerified && (
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => setApproveDialog({
              visible: true,
              userId: item._id,
              userName: `${item.firstName} ${item.lastName}`,
              currentStatus: item.isApproved
            })}
          >
            <UserCheck size={16} color="#fff" />
            <Text style={styles.approveButtonText}>Approve User</Text>
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  );

  const renderModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'view' && 'User Details'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'role' && 'Change Role'}
                {modalType === 'payment' && 'Update Payment'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {modalType === 'view' && (
              <ScrollView>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Personal Information</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Name:</Text>
                    <Text style={styles.detailItemValue}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Email:</Text>
                    <Text style={styles.detailItemValue}>{selectedUser.email}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Mobile:</Text>
                    <Text style={styles.detailItemValue}>{selectedUser.mobile}</Text>
                  </View>
                </View>

                <Divider />

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Account Status</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Role:</Text>
                    <Chip style={styles.roleChip} textStyle={styles.roleText}>
                      {selectedUser.role}
                    </Chip>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Verified:</Text>
                    <Text>{selectedUser.isVerified ? 'Yes' : 'No'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Approved:</Text>
                    <Text>{selectedUser.isApproved ? 'Yes' : 'No'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Payment Status:</Text>
                    <Text>{selectedUser.paymentStatus ? 'Paid' : 'Unpaid'}</Text>
                  </View>
                </View>

                {selectedUser.address && Object.keys(selectedUser.address).length > 0 && (
                  <>
                    <Divider />
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Address</Text>
                      {Object.entries(selectedUser.address).map(([key, value]) => (
                        <View key={key} style={styles.detailItem}>
                          <Text style={styles.detailItemLabel}>{key}:</Text>
                          <Text style={styles.detailItemValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>
            )}

            {modalType === 'edit' && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={editForm.firstName}
                  onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={editForm.lastName}
                  onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mobile"
                  value={editForm.mobile}
                  onChangeText={(text) => setEditForm({ ...editForm, mobile: text })}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Designation"
                  value={editForm.emailDesignation}
                  onChangeText={(text) => setEditForm({ ...editForm, emailDesignation: text })}
                />
                <Button
                  mode="contained"
                  onPress={handleUpdateUser}
                  loading={loading}
                  style={styles.modalButton}
                  buttonColor={THEME}
                >
                  Update User
                </Button>
              </View>
            )}

            {modalType === 'role' && (
              <View>
                <Text style={styles.label}>Select Role</Text>
                <View style={styles.roleOptions}>
                  {['user', 'admin', 'superadmin'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        roleForm.role === role && styles.roleOptionSelected
                      ]}
                      onPress={() => setRoleForm({ role })}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        roleForm.role === role && styles.roleOptionTextSelected
                      ]}>
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Button
                  mode="contained"
                  onPress={handleUpdateRole}
                  loading={loading}
                  style={styles.modalButton}
                  buttonColor={THEME}
                >
                  Update Role
                </Button>
              </View>
            )}

            {modalType === 'payment' && (
              <View>
                <View style={styles.switchContainer}>
                  <Text style={styles.label}>Payment Status</Text>
                  <TouchableOpacity
                    style={[
                      styles.statusSwitch,
                      paymentForm.paymentStatus ? styles.statusActive : styles.statusInactive
                    ]}
                    onPress={() => setPaymentForm({ ...paymentForm, paymentStatus: !paymentForm.paymentStatus })}
                  >
                    <Text style={styles.statusSwitchText}>
                      {paymentForm.paymentStatus ? 'Paid' : 'Unpaid'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {paymentForm.paymentStatus && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Transaction ID"
                      value={paymentForm.transactionId}
                      onChangeText={(text) => setPaymentForm({ ...paymentForm, transactionId: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Amount"
                      value={paymentForm.amount}
                      onChangeText={(text) => setPaymentForm({ ...paymentForm, amount: text })}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <Button
                  mode="contained"
                  onPress={handleUpdatePayment}
                  loading={loading}
                  style={styles.modalButton}
                  buttonColor={THEME}
                >
                  Update Payment
                </Button>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="User Management" />

      <View style={styles.header}>
        <View style={styles.searchFilterContainer}>
          <Searchbar
            placeholder="Search users..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            icon={() => <Search size={20} color="#666" />}
          />
          
          <Menu
            visible={filterMenuVisible}
            onDismiss={() => setFilterMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterMenuVisible(true)}
              >
                <Filter size={20} color={THEME} />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, role: 'user' });
                setFilterMenuVisible(false);
              }}
              title="Role: User"
            />
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, role: 'admin' });
                setFilterMenuVisible(false);
              }}
              title="Role: Admin"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, isApproved: 'true' });
                setFilterMenuVisible(false);
              }}
              title="Approved Users"
            />
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, isApproved: 'false' });
                setFilterMenuVisible(false);
              }}
              title="Pending Approval"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, paymentStatus: 'true' });
                setFilterMenuVisible(false);
              }}
              title="Paid Users"
            />
            <Menu.Item
              onPress={() => {
                setFilters({ ...filters, paymentStatus: 'false' });
                setFilterMenuVisible(false);
              }}
              title="Unpaid Users"
            />
          </Menu>
        </View>

        {renderFilterChips()}
      </View>

      {renderStats()}

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME} />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[THEME]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Users size={48} color="#ccc" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
          ListFooterComponent={
            pagination.totalPages > 1 && (
              <View style={styles.pagination}>
                <Button
                  mode="outlined"
                  onPress={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Text style={styles.pageInfo}>
                  Page {pagination.page} of {pagination.totalPages}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </View>
            )
          }
        />
      )}

      {renderModal()}

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialog.visible}
          onDismiss={() => setDeleteDialog({ ...deleteDialog, visible: false })}
        >
          <Dialog.Title>
            {deleteDialog.permanent ? 'Permanent Delete' : 'Temporary Delete'}
          </Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to {deleteDialog.permanent ? 'permanently delete' : 'temporarily delete'}{' '}
              {deleteDialog.userName}?
            </Text>
            {deleteDialog.permanent && (
              <Text style={styles.warningText}>
                This action cannot be undone. All user data will be permanently removed.
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog({ ...deleteDialog, visible: false })}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor={deleteDialog.permanent ? '#DC2626' : THEME}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Approve Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={approveDialog.visible}
          onDismiss={() => setApproveDialog({ ...approveDialog, visible: false })}
        >
          <Dialog.Title>Approve User</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to approve {approveDialog.userName}?
              They will be able to login after approval.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApproveDialog({ ...approveDialog, visible: false })}>
              Cancel
            </Button>
            <Button onPress={handleApproveToggle} textColor={THEME}>
              Approve
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterContainer: {
    marginTop: 12
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: THEME_LIGHT
  },
  clearFilters: {
    color: THEME,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    paddingVertical: 8
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  statCard: {
    width: 120,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 16
  },
  userCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff'
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  userMobile: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5'
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7'
  },
  approvedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500'
  },
  pendingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500'
  },
  roleChip: {
    backgroundColor: '#E2E8F0',
    height: 24
  },
  roleText: {
    fontSize: 12,
    color: '#475569'
  },
  divider: {
    marginVertical: 12
  },
  userDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B'
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  paidText: {
    color: '#10B981'
  },
  unpaidText: {
    color: '#EF4444'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    marginTop: 8
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 8
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  pageInfo: {
    fontSize: 14,
    color: '#666'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  detailSection: {
    marginBottom: 16
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  detailItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  detailItemLabel: {
    width: 120,
    fontSize: 14,
    color: '#64748B'
  },
  detailItemValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center'
  },
  roleOptionSelected: {
    backgroundColor: THEME_LIGHT,
    borderColor: THEME
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666'
  },
  roleOptionTextSelected: {
    color: THEME,
    fontWeight: '500'
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusSwitch: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981'
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444'
  },
  statusSwitchText: {
    fontSize: 14,
    fontWeight: '500'
  },
  modalButton: {
    marginTop: 8,
    borderRadius: 10
  },
  warningText: {
    color: '#DC2626',
    marginTop: 8,
    fontSize: 14
  }
});