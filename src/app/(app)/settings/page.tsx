"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [theme, setTheme] = useState<string>("system");
  const [weekStartDay, setWeekStartDay] = useState<string>("1");
  const [dayStartHour, setDayStartHour] = useState<string>("8");
  const [dayEndHour, setDayEndHour] = useState<string>("18");
  const [timeSlotDuration, setTimeSlotDuration] = useState<string>("30");
  const [showWeekends, setShowWeekends] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(v) => v && setTheme(v)}>
                  <SelectTrigger id="theme" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Calendar</CardTitle>
              <CardDescription>
                Configure your calendar preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="week-start">Week starts on</Label>
                <Select value={weekStartDay} onValueChange={(v) => v && setWeekStartDay(v)}>
                  <SelectTrigger id="week-start" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="day-start">Day starts at</Label>
                <Select value={dayStartHour} onValueChange={(v) => v && setDayStartHour(v)}>
                  <SelectTrigger id="day-start" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h === 0
                          ? "12:00 AM"
                          : h < 12
                            ? `${h}:00 AM`
                            : h === 12
                              ? "12:00 PM"
                              : `${h - 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="day-end">Day ends at</Label>
                <Select value={dayEndHour} onValueChange={(v) => v && setDayEndHour(v)}>
                  <SelectTrigger id="day-end" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h === 0
                          ? "12:00 AM"
                          : h < 12
                            ? `${h}:00 AM`
                            : h === 12
                              ? "12:00 PM"
                              : `${h - 12}:00 PM`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="slot-duration">Time slot duration</Label>
                <Select
                  value={timeSlotDuration}
                  onValueChange={(v) => v && setTimeSlotDuration(v)}
                >
                  <SelectTrigger id="slot-duration" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-weekends">Show weekends</Label>
                  <p className="text-xs text-muted-foreground">
                    Display Saturday and Sunday in the calendar
                  </p>
                </div>
                <Switch
                  id="show-weekends"
                  checked={showWeekends}
                  onCheckedChange={setShowWeekends}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Features</CardTitle>
              <CardDescription>
                Configure AI-powered scheduling assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ai-enabled">Enable AI features</Label>
                  <p className="text-xs text-muted-foreground">
                    Get smart scheduling suggestions and task prioritization
                  </p>
                </div>
                <Switch
                  id="ai-enabled"
                  checked={aiEnabled}
                  onCheckedChange={setAiEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
