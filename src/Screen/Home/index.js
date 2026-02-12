import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
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
  Heart
} from "lucide-react-native";
import Header from "../../Components/layout/Header";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Lodge Info Banner */}
        <View style={styles.lodgeBanner}>
          <View style={styles.lodgeCrestContainer}>
            
            <Crown size={48} color="#FFF" />

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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
            
            {/* Meeting Card */}
            <Card style={[styles.card, styles.meetingCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                 <CalendarIcon size={20} color="#8B0000" />
                  <Text style={styles.cardLabel}>NEXT MEETING</Text>
                </View>
                <Text style={styles.cardTitle}>Jan 15, 2026</Text>
                <Text style={styles.cardText}>Third Degree Working</Text>
                <View style={styles.cardFooter}>
                    <Clock size={14} color="#666" />
                  <Text style={styles.cardTime}>6:30 PM • Dining Room</Text>
                </View>
                <Button 
                  mode="contained" 
                  style={styles.cardButton}
                  labelStyle={styles.buttonLabel}
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>

            {/* Attendance Card */}
            <Card style={[styles.card, styles.attendanceCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                 <Users size={20} color="#C9A227" />
                  <Text style={styles.cardLabel}>ATTENDANCE</Text>
                </View>
                <Text style={styles.cardText}>Are you attending the next meeting?</Text>
                <View style={styles.attendanceButtons}>
                  <Button 
                    mode="contained" 
                    style={[styles.attendanceBtn, styles.yesBtn]}
                    labelStyle={styles.buttonLabel}
                  >
                    <Check size={16} color="#FFF" /> Yes
                  </Button>
                  <Button 
                    mode="outlined" 
                    style={[styles.attendanceBtn, styles.apologyBtn]}
                    labelStyle={styles.buttonLabel}
                  >
                     <X size={16} color="#666" /> Send Apology
                  </Button>
                </View>
                <Text style={styles.attendanceNote}>12 Brothers confirmed</Text>
              </Card.Content>
            </Card>

            {/* Dues Card */}
            <Card style={[styles.card, styles.duesCard]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                    <CreditCard size={20} color="#1E3A8A" />
                  <Text style={styles.cardLabel}>MEMBERSHIP DUES</Text>
                </View>
                <View style={styles.duesAmountContainer}>
                  <Text style={styles.dueAmount}>$150.00</Text>
                  <Badge style={styles.dueBadge}>Due</Badge>
                </View>
                <Text style={styles.dueDate}>Due by Jan 30, 2026</Text>
                 <Button mode="contained" style={styles.payButton} labelStyle={styles.buttonLabel} icon={() => <DollarSign size={16} color="#FFF" />}>
                  Pay Now
                </Button>
              </Card.Content>
            </Card>

          </ScrollView>
        </View>

        {/* Announcements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color="#8B0000" />
            </TouchableOpacity>
          </View>

          <Announcement
            icon={<File size={20} color="#8B0000" />}
            title="January Summons Released"
            time="2h ago"
            desc="The summons for the upcoming regular meeting has been published. All members are requested to review."
            category="Official"
          />

          <Announcement
            icon={<Bullhorn size={20} color="#C9A227" />}
            title="Provincial Grand Lodge Visit"
            time="1d ago"
            desc="Provincial Grand Master will be visiting next month. Prepare for special ceremonies."
            category="Important"
          />

          <Announcement
           icon={<Heart size={20} color="#1E3A8A" />}
            title="Charity Dinner Event"
            time="3d ago"
            desc="Annual charity dinner scheduled for February 20th. Please RSVP by Feb 10th."
            category="Event"
          />

        </View>

        {/* Gallery Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lodge Life</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventsGrid}>
            <EventCard
              icon="users"
              title="Stated Meeting"
              date="Jan 15"
              color="#8B0000"
            />
            <EventCard
              icon="gift"
              title="Festive Board"
              date="Jan 22"
              color="#C9A227"
            />
            <EventCard
              icon="book"
              title="Education Night"
              date="Feb 5"
              color="#1E3A8A"
            />
            <EventCard
              icon="heart"
              title="Charity Event"
              date="Feb 20"
              color="#2E7D32"
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* 🔹 Announcement Item Component */
function Announcement({  title, time, desc, category }) {
  const categoryColors = {
    Official: "#8B0000",
    Important: "#C9A227",
    Event: "#1E3A8A",
  };

  return (
    <TouchableOpacity style={styles.announcement}>
      <View style={[styles.annIcon, { backgroundColor: categoryColors[category] + '15' }]}>
        <File size={20} color={categoryColors[category]} />
      </View>
      <View style={styles.annContent}>
        <View style={styles.annHeader}>
          <Text style={styles.annTitle}>{title}</Text>
          <Badge style={[styles.categoryBadge, { backgroundColor: categoryColors[category] }]}>
            {category}
          </Badge>
        </View>
        <Text style={styles.annDesc}>{desc}</Text>
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
function EventCard({ title, date, color }) {
  return (
    <TouchableOpacity style={styles.eventCard}>
      <View style={[styles.eventIcon, { backgroundColor: color + '15' }]}>
        <CalendarIcon size={24} color={color} />
      </View>
      <Text style={styles.eventTitle}>{title}</Text>
      <View style={styles.eventDate}>
        <CalendarIcon size={12} color={color} />
        <Text style={[styles.eventDateText, { color }]}>{date}</Text>
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
    backgroundColor: '#1A237E',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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