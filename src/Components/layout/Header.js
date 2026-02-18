import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  User,
  LogOut,
  CalendarPlus,
  Users,
  FileUp,
  UserCircle,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header() {
  // ✅ ALL HOOKS AT TOP
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // ✅ SAFE useEffect
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('userData');
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role);
      } catch (e) {
        console.log('Failed to load user role');
      }
    };

    loadUser();
  }, []);

 const logout = async () => {
  try {
    setMenuVisible(false);
    await AsyncStorage.clear();   // removes all keys
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  } catch (e) {
    console.log('Logout error:', e);
  }
};

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', zIndex: 10, height: "12%" }}>
      <View style={styles.header}>
        {/* LEFT */}
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/applogo.jpeg')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('NotificationPage')}
          >
            <Bell size={24} color="#333" />
            <View style={styles.badge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setMenuVisible(prev => !prev)}
          >
            <User size={24} color="#333" />
          </TouchableOpacity>

          {/* DROPDOWN */}
          {menuVisible && (
            <View style={styles.dropdown}>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Profile');
                }}
              >
                <UserCircle size={18} color="#333" />
                <Text style={styles.menuText}>Profile</Text>
              </Pressable>

              {/* ✅ ADMIN ONLY */}
              {userRole === 'admin' && (
                <>
                <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('allusers');
                }}
              >
                <UserCircle size={18} color="#333" />
                <Text style={styles.menuText}>All Users</Text>
              </Pressable>
                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('AdminEvent');
                    }}
                  >
                    <CalendarPlus size={18} color="#333" />
                    <Text style={styles.menuText}>Create Event</Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('AdminAnouncement');
                    }}
                  >
                    <Users size={18} color="#333" />
                    <Text style={styles.menuText}>
                      Create Announcement
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      navigation.navigate('UploadDocuments');
                    }}
                  >
                    <FileUp size={18} color="#333" />
                    <Text style={styles.menuText}>
                      Upload Documents
                    </Text>
                  </Pressable>

                  <View style={styles.divider} />
                </>
              )}

              <Pressable style={styles.menuItem} onPress={logout}>
                <LogOut size={18} color="#FF3B30" />
                <Text style={[styles.menuText, { color: '#FF3B30' }]}>
                  Logout
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 6,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },

  /* DROPDOWN */
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
  },
});
