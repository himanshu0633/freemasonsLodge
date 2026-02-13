import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, User, LogOut, CalendarPlus, Users, FileUp, UserCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  const logout = () => {
    setMenuVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', zIndex: 10 }}>
      <View style={styles.header}>
        {/* LEFT */}
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.jpeg')}
              style={styles.logo}
            />
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}  onPress={() => {
                  // setMenuVisible(false);
                  navigation.navigate('NotificationPage');
                }}>
            <Bell size={24} color="#333" />
            <View style={styles.badge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <User size={24} color="#333" />
          </TouchableOpacity>

          {/* PROFILE DROPDOWN */}
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
                  navigation.navigate('NotificationPage');
                }}
              >
                <Users size={18} color="#333" />
                <Text style={styles.menuText}>Create Meeting</Text>
              </Pressable>

              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('UploadDocuments');
                }}
              >
                <FileUp size={18} color="#333" />
                <Text style={styles.menuText}>Upload Documents</Text>
              </Pressable>

              <View style={styles.divider} />

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
    paddingVertical: 12,
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
