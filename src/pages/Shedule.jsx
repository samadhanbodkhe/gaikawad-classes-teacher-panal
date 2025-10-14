import React from "react";
import { useGetTeacherScheduleQuery } from "../redux/apis/scheduleApi";
import { Loader2 } from "lucide-react";

const Schedule = () => {
    const { data, isLoading } = useGetTeacherScheduleQuery();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin" size={30} />
            </div>
        );
    }

    if (!data?.success) {
        return <p className="text-center mt-10 text-red-500">No schedules found.</p>;
    }

    const schedules = data.schedules;

    const todayDate = new Date().toDateString();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-10">📅 My Teaching Schedule</h1>

                <div className="overflow-x-auto bg-white text-black rounded-3xl shadow-2xl p-6">
                    <table className="min-w-full border border-gray-200 rounded-xl">
                        <thead className="bg-indigo-100 text-black uppercase text-sm font-semibold">
                            <tr>
                                <th className="px-6 py-3">Day</th>
                                <th className="px-6 py-3">Class / Batch</th>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Mode</th>
                                <th className="px-6 py-3">Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No schedules found.
                                    </td>
                                </tr>
                            )}
                            {schedules.map((schedule) => {
                                const scheduleDate = new Date(schedule.startTime).toDateString();
                                const isToday = scheduleDate === todayDate;

                                return (
                                    <tr
                                        key={schedule._id}
                                        className={`hover:bg-gray-50 transition ${
                                            isToday ? "bg-green-100 text-black font-semibold" : ""
                                        }`}
                                    >
                                        <td className="px-6 py-3 border-b">
                                            {new Date(schedule.startTime).toLocaleDateString("en-US", {
                                                weekday: "long",
                                            })}
                                        </td>
                                        <td className="px-6 py-3 border-b">{schedule.batchName}</td>
                                        <td className="px-6 py-3 border-b">{schedule.subject}</td>
                                        <td className="px-6 py-3 border-b">
                                            {new Date(schedule.startTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            -{" "}
                                            {new Date(schedule.endTime).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-6 py-3 border-b capitalize">{schedule.mode}</td>
                                        <td className="px-6 py-3 border-b">{schedule.room || "-"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
