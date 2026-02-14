import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Alert } from "react-native";
import { Card, Button, Badge } from "react-native-paper";
import {
  ShieldCrown,
  Calendar as CalendarIcon,
  Clock,
  Crown,
  Users,
  DollarSign,
  Check,
  X,
  CreditCard,
  File,
  Bullhorn,
  ChevronRight,
  Hammer,
  SilverwareForkKnife,
  School,
  Heart,
  MapPin
} from "lucide-react-native";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { format, isFuture } from "date-fns";

export default function Home() {
 const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState(null);
   const [announcements, setAnnouncements] = useState([]);
     const isFocused = useIsFocused();
     const [visibleCount, setVisibleCount] = useState(4);
  const navigation = useNavigation();
  


     useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        if (!storedUser) return;
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser._id);
      } catch {
        Alert.alert("Error", "Failed to load user data");
      }
    };

    if (isFocused) loadUser();
  }, [isFocused]);


     useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/events/admin/all");
        setEvents(res.data?.events || []);
      } catch {
        Alert.alert("Error", "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    if (isFocused && userId) {
      fetchEvents();
    }
  }, [isFocused, userId]);


    useEffect(() => {
    
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/announcements/all");
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
      console.log("kjfnd", res.data);
    } catch {
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };
   if (isFocused ) {
      fetchAnnouncements();
    }
}, [isFocused])




    const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* 🔹 Filter upcoming */
  const upcomingEvents = events.filter(
    (e) => new Date(e.date) >= new Date()
  );

  const nextEvent =
    events
      .filter(e => isFuture(new Date(e.date)))
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0] || null;

  /* ---------------- Attendance Action ---------------- */
  const markAttendance = async (eventId, status) => {
    try {
      await axiosInstance.post(`/events/${eventId}/attendance`, {
        status,
        userId,
      });
      const res = await axiosInstance.get("/events/admin/all");
      setEvents(res.data?.events || []);
    } catch {
      Alert.alert("Error", "Could not update attendance");
    }
  };

  /* 🔹 Load more */
  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

   const goToAttendance = (event) => {
    navigation.navigate("attendance", { eventId: event._id });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Lodge Info Banner */}
        <View style={styles.lodgeBanner}>
          <View style={styles.lodgeCrestContainer}>
            
           <Image
                         source={require('../../assets/applogo.jpeg')}
                         style={styles.logo}
                       />
          </View>
          <View style={styles.lodgeInfo}>
            <Text style={styles.lodgeName}>Lodge Mother India</Text>
            <Text style={styles.lodgeDetails}>No. 110 • Est. 1935</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active Member</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* ================= NEXT MEETING ================= */}
            <Card style={[styles.card, styles.meetingCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <CalendarIcon size={20} color="#8B0000" />
                  <Text style={styles.cardLabel}>NEXT MEETING</Text>
                </View>

                {nextEvent ? (
                  <>
                    <Text style={styles.cardTitle}>{nextEvent.title}</Text>
                    <Text style={styles.cardText}>
                      {nextEvent.description || "No description provided"}
                    </Text>

                    <View style={styles.metaRow}>
                      {/* <Clock size={14} color="#666" /> */}
                      <Text style={styles.metaText}>
                        {format(new Date(nextEvent.date), "dd MMM yyyy • h:mm a")}
                      </Text>
                    </View>

                    {/* <View style={styles.metaRow}>
                      <MapPin size={14} color="#666" />
                      <Text style={styles.metaText}>
                        {nextEvent.location || "Lodge Hall"}
                      </Text>
                    </View> */}

                    <Button
                      mode="contained"
                      style={styles.cardButton}
                      onPress={() =>
                        navigation.navigate("attendance", {
                          eventId: nextEvent._id,
                        })
                      }
                    >
                      View Details
                    </Button>
                  </>
                ) : (
                  <Text style={styles.cardText}>No upcoming meetings</Text>
                )}
              </Card.Content>
            </Card>

            {/* ================= ATTENDANCE ================= */}
            <Card style={[styles.card, styles.attendanceCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Users size={20} color="#C9A227" />
                  <Text style={styles.cardLabel}>ATTENDANCE</Text>
                </View>

                {nextEvent ? (
                  <>
                    <Text style={styles.cardText}>
                      Are You Attending the next meeting?
                    </Text>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                      <Text>{nextEvent.stats?.attending ?? 0} brothers attending</Text>
                      {/* <Text>Maybe: {nextEvent.stats?.maybe ?? 0}</Text>
                      <Text>No: {nextEvent.stats?.notAttending ?? 0}</Text> */}
                    </View>

                    {/* Actions */}
                    <View style={styles.attendanceButtons}>
                      <Button
                        mode="contained"
                        style={styles.yesBtn}
                        onPress={() =>
                          markAttendance(nextEvent._id, "attending")
                        }
                      >
                        <Check size={16} color="#FFF" /> Yes
                      </Button>

                      <Button
                        mode="outlined"
                        onPress={() =>
                          markAttendance(nextEvent._id, "not_attending")
                        }
                      >
                        <X size={16} /> No
                      </Button>
                    </View>
                  </>
                ) : (
                  <Text style={styles.cardText}>
                    No upcoming event to respond
                  </Text>
                )}
              </Card.Content>
            </Card>

            {/* ================= DUES ================= */}
            <Card style={[styles.card, styles.duesCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <CreditCard size={20} color="#1E3A8A" />
                  <Text style={styles.cardLabel}>MEMBERSHIP DUES</Text>
                </View>
                <Text style={styles.cardTitle}>$150.00</Text>
                <Badge style={styles.dueBadge}>Due</Badge>
                <Button mode="contained" style={styles.payButton}>
                  Pay Now
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
     
       
        {/* Announcements Section */}
     {/* Announcements Section */}
<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Announcements</Text>
    <TouchableOpacity
      style={styles.viewAllBtn}
      onPress={() => navigation.navigate("announcements")}
    >
      <Text style={styles.viewAllText}>View All</Text>
      <ChevronRight size={16} color="#8B0000" />
    </TouchableOpacity>
  </View>

  {announcements.slice(0, 4).map((item) => (
    <Announcement
      key={item._id}
      title={item.title}
      desc={item.description}
      category={item.type}
      time={format(new Date(item.createdAt), "dd MMM • h:mm a")}
      onPress={() =>
        navigation.navigate("announcements", { id: item._id })
      }
    />
  ))}

  {announcements.length === 0 && (
    <Text style={{ color: "#666", textAlign: "center" }}>
      No announcements available
    </Text>
  )}
</View>


        {/* Gallery Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lodge Life</Text>
            <TouchableOpacity style={styles.viewAllBtn}  onPress={() => navigation.navigate("Gallery")}>
              <Text style={styles.viewAllText}>View Gallery</Text>
               <ChevronRight size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.galleryCard}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop" }}
              style={styles.galleryImage}
            />
            <View style={styles.galleryOverlay}>
              <View style={styles.galleryBadge}>
                <ChevronRight size={16} color="#FFF" />
                <Text style={styles.galleryBadgeText}>24 Photos</Text>
              </View>
              <Text style={styles.galleryTitle}>December Meeting Gallery</Text>
              <Text style={styles.galleryDesc}>Third Degree conferral and festive board</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events */}
       {/* Upcoming Events */}
 <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>

          <View style={styles.eventsGrid}>
            {upcomingEvents.slice(0, visibleCount).map((event) => (
              <EventCard
                key={event._id}
                title={event.title}
                date={formatDate(event.date)}
                onPress={() => goToAttendance(event)}
              />
            ))}
          </View>

          {visibleCount < upcomingEvents.length && (
            <Button mode="outlined" style={{ marginTop: 16 }} onPress={loadMore}>
              View More
            </Button>
          )}
        </View>



      </ScrollView>
    </SafeAreaView>
  );
}

/* 🔹 Announcement Item Component */
function Announcement({ title, time, desc, category, onPress }) {
  const categoryColors = {
    General: "#1E3A8A",
    Notice: "#C9A227",
    Urgent: "#8B0000",
  };

  const color = categoryColors[category] || "#666";

  return (
    <TouchableOpacity style={styles.announcement} onPress={onPress}>
      <View style={[styles.annIcon, { backgroundColor: color + "15" }]}>
        <File size={20} color={color} />
      </View>

      <View style={styles.annContent}>
        <View style={styles.annHeader}>
          <Text style={styles.annTitle}>{title}</Text>
          <Badge style={[styles.categoryBadge, { backgroundColor: color }]}>
            {category}
          </Badge>
        </View>

        <Text style={styles.annDesc} numberOfLines={2}>
          {desc}
        </Text>

        <View style={styles.annFooter}>
          <View style={styles.timeBadge}>
            <Clock size={12} color="#666" />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </View>

      <ChevronRight size={18} color="#999" />
    </TouchableOpacity>
  );
}


/* 🔹 Event Card Component */
function EventCard({ title , date}) {
  return (
    <TouchableOpacity style={styles.eventCard}>
      <View style={[styles.eventIcon, { backgroundColor: "#8B000015" }]}>
        <CalendarIcon size={24} color="#8B0000" />
      </View>

      <Text style={styles.eventTitle}>{title}</Text>
       <View style={styles.eventDate}>
        <CalendarIcon size={12} color="#8B0000" />
        <Text style={[styles.eventDateText]}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}


/* 🎨 Enhanced Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContainer: {
    flex: 1,
  },
  lodgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C21807',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 30,
  },
  lodgeCrestContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lodgeInfo: {
    flex: 1,
  },
  lodgeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  lodgeDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  hScroll: {
    paddingVertical: 8,
  },
  card: {
    width: 300,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  meetingCard: {
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  attendanceCard: {
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderLeftColor: '#C9A227',
  },
  duesCard: {
    backgroundColor: '#FFF',
    borderLeftWidth: 4,
    borderLeftColor: '#1E3A8A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardTime: {
    fontSize: 12,
    color: '#666',
  },
  cardButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  attendanceBtn: {
    flex: 1,
    borderRadius: 8,
  },
  yesBtn: {
    backgroundColor: '#2E7D32',
  },
  apologyBtn: {
    borderColor: '#666',
  },
  attendanceNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  duesAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dueAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF3B30',
  },
  dueBadge: {
    backgroundColor: '#FF3B30',
    color: '#FFF',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: '600',
  },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  annIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  annContent: {
    flex: 1,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  annTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    fontSize: 10,
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  annDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  annFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: '#666',
  },
  galleryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  galleryImage: {
    height: 200,
    width: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  galleryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  galleryBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  galleryDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eventCard: {
    width: '47%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  eventIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  eventDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
});