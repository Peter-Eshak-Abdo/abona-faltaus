"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Clock } from "lucide-react";

interface Verse {
  id: string;
  text: string;
  reference: string;
  createdAt: Date;
}

interface NotificationSchedule {
  id: string;
  time: string; // HH:MM format
  enabled: boolean;
  daysOfWeek: number[]; // 0-6, Sunday=0
  createdAt: Date;
}

export default function AdminPage() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
  const [newVerse, setNewVerse] = useState({ text: "", reference: "" });
  const [newSchedule, setNewSchedule] = useState({ time: "08:00", enabled: true, daysOfWeek: [1, 2, 3, 4, 5] }); // Monday to Friday
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load verses
      const versesSnapshot = await getDocs(collection(db, "verses"));
      const versesData = versesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Verse[];
      setVerses(versesData);

      // Load schedules
      const schedulesSnapshot = await getDocs(collection(db, "notificationSchedules"));
      const schedulesData = schedulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as NotificationSchedule[];
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addVerse = async () => {
    if (!newVerse.text.trim() || !newVerse.reference.trim()) return;

    try {
      await addDoc(collection(db, "verses"), {
        ...newVerse,
        createdAt: new Date()
      });
      setNewVerse({ text: "", reference: "" });
      loadData();
    } catch (error) {
      console.error("Error adding verse:", error);
    }
  };

  const updateVerse = async () => {
    if (!editingVerse) return;

    try {
      await updateDoc(doc(db, "verses", editingVerse.id), {
        text: editingVerse.text,
        reference: editingVerse.reference
      });
      setEditingVerse(null);
      loadData();
    } catch (error) {
      console.error("Error updating verse:", error);
    }
  };

  const deleteVerse = async (id: string) => {
    try {
      await deleteDoc(doc(db, "verses", id));
      loadData();
    } catch (error) {
      console.error("Error deleting verse:", error);
    }
  };

  const addSchedule = async () => {
    try {
      await addDoc(collection(db, "notificationSchedules"), {
        ...newSchedule,
        createdAt: new Date()
      });
      setNewSchedule({ time: "08:00", enabled: true, daysOfWeek: [1, 2, 3, 4, 5] });
      loadData();
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await updateDoc(doc(db, "notificationSchedules", id), { enabled });
      loadData();
    } catch (error) {
      console.error("Error toggling schedule:", error);
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notificationSchedules", id));
      loadData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalUserId: 'test-user-id' }) // Replace with actual user ID
      });
      if (response.ok) {
        alert('Test notification sent!');
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">إدارة الإشعارات والآيات</h1>

      {/* Test Notification Button */}
      <Card>
        <CardHeader>
          <CardTitle>اختبار الإشعارات</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={sendTestNotification} className="w-full">
            إرسال إشعار تجريبي
          </Button>
        </CardContent>
      </Card>

      {/* Verses Management */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة الآيات ({verses.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Verse */}
          <div className="space-y-2">
            <Textarea
              placeholder="نص الآية"
              value={newVerse.text}
              onChange={(e) => setNewVerse({ ...newVerse, text: e.target.value })}
            />
            <Input
              placeholder="المرجع (مثال: يوحنا 3:16)"
              value={newVerse.reference}
              onChange={(e) => setNewVerse({ ...newVerse, reference: e.target.value })}
            />
            <Button onClick={addVerse} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              إضافة آية جديدة
            </Button>
          </div>

          {/* Verses List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {verses.map((verse) => (
              <Card key={verse.id} className="p-4">
                {editingVerse?.id === verse.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingVerse.text}
                      onChange={(e) => setEditingVerse({ ...editingVerse, text: e.target.value })}
                    />
                    <Input
                      value={editingVerse.reference}
                      onChange={(e) => setEditingVerse({ ...editingVerse, reference: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={updateVerse} size="sm">حفظ</Button>
                      <Button onClick={() => setEditingVerse(null)} variant="outline" size="sm">إلغاء</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm mb-1">{verse.text}</p>
                      <Badge variant="secondary">{verse.reference}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingVerse(verse)} size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => deleteVerse(verse.id)} size="sm" variant="destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedules Management */}
      <Card>
        <CardHeader>
          <CardTitle>جدولة الإشعارات ({schedules.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Schedule */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
              />
              <Button onClick={addSchedule} className="flex-1">
                <Clock className="w-4 h-4 mr-2" />
                إضافة جدولة جديدة
              </Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {dayNames.map((day, index) => (
                <Badge
                  key={index}
                  variant={newSchedule.daysOfWeek.includes(index) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newDays = newSchedule.daysOfWeek.includes(index)
                      ? newSchedule.daysOfWeek.filter(d => d !== index)
                      : [...newSchedule.daysOfWeek, index];
                    setNewSchedule({ ...newSchedule, daysOfWeek: newDays });
                  }}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          {/* Schedules List */}
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Badge variant={schedule.enabled ? "default" : "secondary"}>
                      {schedule.time}
                    </Badge>
                    <div className="flex gap-1">
                      {schedule.daysOfWeek.map(day => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {dayNames[day]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleSchedule(schedule.id, !schedule.enabled)}
                      size="sm"
                      variant={schedule.enabled ? "default" : "outline"}
                    >
                      {schedule.enabled ? "مفعل" : "معطل"}
                    </Button>
                    <Button onClick={() => deleteSchedule(schedule.id)} size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
