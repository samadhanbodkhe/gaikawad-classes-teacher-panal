import React from "react";
import { useGetTeacherScheduleQuery } from "../redux/apis/scheduleApi";
import { Loader2, Calendar, Clock, Users, BookOpen, MapPin, Monitor } from "lucide-react";

const Schedule = () => {
    const { data, isLoading } = useGetTeacherScheduleQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-blue-600" size={30} />
            </div>
        );
    }

    if (!data?.success || !data.schedules || data.schedules.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">No Schedules Found</h2>
                    <p className="text-gray-500">You don't have any teaching schedules assigned yet.</p>
                </div>
            </div>
        );
    }

    const schedules = data.schedules;

    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Function to get day name from date string (YYYY-MM-DD)
    const getDayName = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", { weekday: "long" });
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Function to format date display
    const formatDisplayDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (dateString === todayString) {
                return "Today";
            } else if (dateString === tomorrow.toISOString().split('T')[0]) {
                return "Tomorrow";
            } else {
                return date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            }
        } catch (error) {
            return "Invalid Date";
        }
    };

    // Group schedules by date for better organization
    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const date = schedule.scheduleDate;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(schedule);
        return acc;
    }, {});

    // Sort dates chronologically
    const sortedDates = Object.keys(groupedSchedules).sort();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <Calendar className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        My Teaching Schedule
                    </h1>
                    <p className="text-gray-600 text-lg">
                        View your upcoming classes and teaching sessions
                    </p>
                </div>

                {/* Schedule Cards by Date */}
                <div className="space-y-6">
                    {sortedDates.map((date) => (
                        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Date Header */}
                            <div className={`px-6 py-4 border-b ${
                                date === todayString 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-gray-50 border-gray-200"
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${
                                            date === todayString ? "bg-green-500" : "bg-blue-500"
                                        }`}></div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {formatDisplayDate(date)}
                                        </h2>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {getDayName(date)}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                                        {groupedSchedules[date].length} class{groupedSchedules[date].length !== 1 ? 'es' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Schedule Items */}
                            <div className="divide-y divide-gray-100">
                                {groupedSchedules[date].map((schedule) => (
                                    <div key={schedule._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                            {/* Left Section - Class Info */}
                                            <div className="flex-1 mb-4 lg:mb-0">
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <BookOpen className="text-blue-600" size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {schedule.subject}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center space-x-1">
                                                                <Users size={16} className="text-gray-400" />
                                                                <span>{schedule.batchName}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                {schedule.mode === 'online' ? (
                                                                    <Monitor size={16} className="text-gray-400" />
                                                                ) : (
                                                                    <MapPin size={16} className="text-gray-400" />
                                                                )}
                                                                <span className="capitalize">{schedule.mode}</span>
                                                                {schedule.room && schedule.mode === 'offline' && (
                                                                    <span> • Room {schedule.room}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Section - Time */}
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                                                        <Clock size={18} className="text-gray-400" />
                                                        <span>{schedule.startTime}</span>
                                                        <span className="text-gray-400">-</span>
                                                        <span>{schedule.endTime}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Duration: {
                                                            (() => {
                                                                // Simple duration calculation from time strings
                                                                const parseTime = (timeStr) => {
                                                                    const [time, period] = timeStr.split(' ');
                                                                    const [hours, minutes] = time.split(':');
                                                                    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
                                                                    if (period === 'PM' && hours !== '12') totalMinutes += 12 * 60;
                                                                    if (period === 'AM' && hours === '12') totalMinutes -= 12 * 60;
                                                                    return totalMinutes;
                                                                };

                                                                const startMinutes = parseTime(schedule.startTime);
                                                                const endMinutes = parseTime(schedule.endTime);
                                                                const diffMinutes = endMinutes - startMinutes;
                                                                
                                                                const hours = Math.floor(diffMinutes / 60);
                                                                const minutes = diffMinutes % 60;
                                                                
                                                                if (hours > 0) {
                                                                    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
                                                                }
                                                                return `${minutes}m`;
                                                            })()
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {schedules.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Classes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {schedules.filter(s => s.scheduleDate === todayString).length}
                        </div>
                        <div className="text-sm text-gray-600">Today's Classes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {new Set(schedules.map(s => s.subject)).size}
                        </div>
                        <div className="text-sm text-gray-600">Subjects</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                            {new Set(schedules.map(s => s.batchName)).size}
                        </div>
                        <div className="text-sm text-gray-600">Batches</div>
                    </div>
                </div>

                {/* Table View (Alternative) */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Schedule Overview</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Date & Day
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Batch
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Mode & Room
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schedules.map((schedule) => (
                                    <tr 
                                        key={schedule._id} 
                                        className={`hover:bg-gray-50 transition-colors ${
                                            schedule.scheduleDate === todayString ? 'bg-green-50' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatDisplayDate(schedule.scheduleDate)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {getDayName(schedule.scheduleDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Users size={16} className="mr-2 text-gray-400" />
                                                {schedule.batchName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <BookOpen size={16} className="mr-2 text-gray-400" />
                                                {schedule.subject}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock size={16} className="mr-2 text-gray-400" />
                                                {schedule.startTime} - {schedule.endTime}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {
                                                    (() => {
                                                        const parseTime = (timeStr) => {
                                                            const [time, period] = timeStr.split(' ');
                                                            const [hours, minutes] = time.split(':');
                                                            let totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
                                                            if (period === 'PM' && hours !== '12') totalMinutes += 12 * 60;
                                                            if (period === 'AM' && hours === '12') totalMinutes -= 12 * 60;
                                                            return totalMinutes;
                                                        };

                                                        const startMinutes = parseTime(schedule.startTime);
                                                        const endMinutes = parseTime(schedule.endTime);
                                                        const diffMinutes = endMinutes - startMinutes;
                                                        
                                                        const hours = Math.floor(diffMinutes / 60);
                                                        const minutes = diffMinutes % 60;
                                                        
                                                        if (hours > 0) {
                                                            return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
                                                        }
                                                        return `${minutes}m`;
                                                    })()
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                {schedule.mode === 'online' ? (
                                                    <Monitor size={16} className="mr-2 text-gray-400" />
                                                ) : (
                                                    <MapPin size={16} className="mr-2 text-gray-400" />
                                                )}
                                                <span className="capitalize">{schedule.mode}</span>
                                                {schedule.room && schedule.mode === 'offline' && (
                                                    <span className="ml-2 text-gray-500">(Room {schedule.room})</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;