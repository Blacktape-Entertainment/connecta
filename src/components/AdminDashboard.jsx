import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PocketBase from "pocketbase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  CheckCircle,
  UserPlus,
  Sparkles,
  GraduationCap,
  Gamepad2,
  TrendingUp,
  Globe2,
  Search,
  SortAsc,
  SortDesc,
  LogOut,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const pb = new PocketBase("https://api.worldofconnecta.com");
const COLORS = ["#a78bfa", "#34d399", "#fbbf24", "#38bdf8", "#f472b6"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  /* 🔹 Fetch Data */
  useEffect(() => {
    let isCancelled = false;

    const fetchUsers = async () => {
      try {
        const response = await pb.collection("users").getList(1, 50, {
          sort: "-created",
          $cancelKey: "admin-dashboard-users", // Unique key for this request
        });
        
        if (!isCancelled) {
          setData(response);
        }
      } catch (error) {
        if (!isCancelled && error?.isAbort !== true) {
          console.error("Error fetching users:", error);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
      pb.cancelRequest("admin-dashboard-users");
    };
  }, []);

  const users = useMemo(() => data?.items || [], [data]);
  const totalUsers = data?.totalItems || 0;
  const verifiedUsers = users.filter((u) => u.verified).length;
  const verifiedPercent = totalUsers
    ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
    : 0;

  /* 🔹 Stats Calculations */
  const newUsersThisMonth = useMemo(() => {
    const now = new Date();
    return users.filter((u) => {
      const created = new Date(u.created);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [users]);

  const topInterest = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      if (u.areaOfInterest)
        counts[u.areaOfInterest] = (counts[u.areaOfInterest] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [users]);

  /* 🔹 Chart Data */
  const educationData = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      if (u.educationDegree)
        counts[u.educationDegree] = (counts[u.educationDegree] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const interestData = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      if (u.areaOfInterest)
        counts[u.areaOfInterest] = (counts[u.areaOfInterest] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [users]);

  const favoriteGameData = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      if (u.favoriteGame)
        counts[u.favoriteGame] = (counts[u.favoriteGame] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [users]);

  const userGrowthData = useMemo(() => {
    const monthlyCounts = {};
    users.forEach((u) => {
      const date = new Date(u.created);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    });
    return Object.entries(monthlyCounts)
      .sort()
      .map(([month, count]) => ({ month, count }));
  }, [users]);

  /* 🔹 Search + Sorting */
  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = a[sortBy] || "";
        const bVal = b[sortBy] || "";
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
  }, [users, search, sortBy, sortOrder]);

  const handleLogout = () => {
    pb.authStore.clear();
    sessionStorage.clear();
    navigate("/admin");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-200 text-lg">
        Loading Dashboard...
      </div>
    );

  /* ============================ JSX ============================ */
  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0b0b14] to-black text-white px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-green-300 to-blue-300 text-center sm:text-left"
        >
          Admin Dashboard
        </motion.h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition"
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        <MetricCard title="Total Users" value={totalUsers} icon={<Users />} />
        <MetricCard
          title="Verified Users"
          value={verifiedUsers}
          subText={`${verifiedPercent}% Verified`}
          icon={<CheckCircle />}
        />
        <MetricCard
          title="New This Month"
          value={newUsersThisMonth}
          icon={<UserPlus />}
        />
        <MetricCard
          title="Top Interest"
          value={topInterest}
          icon={<Sparkles />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ChartCard title="Education Distribution" icon={<GraduationCap />}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={educationData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
              >
                {educationData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Areas of Interest" icon={<Globe2 />}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={interestData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis dataKey="name" tick={{ fill: "white", fontSize: 12 }} />
              <YAxis tick={{ fill: "white" }} />
              <Tooltip />
              <Bar dataKey="value" fill="#34d399" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Favorite Games" icon={<Gamepad2 />}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={favoriteGameData}
              margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis type="number" tick={{ fill: "white" }} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "white", fontSize: 16 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e1e2f",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <Bar
                dataKey="value"
                fill="#a78bfa"
                radius={[0, 8, 8, 0]}
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth Over Time" icon={<TrendingUp />}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" tick={{ fill: "white" }} />
              <YAxis tick={{ fill: "white" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#34d399"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
};

/* ----------------- Reusable Components ----------------- */

const MetricCard = ({ title, value, subText, icon }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-green-400/10 transition"
  >
    <div className="flex items-center gap-3 mb-2 text-gray-300">
      <div className="p-2 bg-white/10 rounded-lg text-green-300">{icon}</div>
      <h3 className="font-medium text-sm">{title}</h3>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    {subText && <p className="text-gray-400 text-sm mt-1">{subText}</p>}
  </motion.div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white/10 p-5 rounded-xl border border-white/20 shadow-lg backdrop-blur-lg">
    <div className="flex items-center gap-2 mb-3 text-gray-300 font-semibold text-sm">
      {icon} <span>{title}</span>
    </div>
    {children}
  </div>
);

const UserTable = ({
  users,
  search,
  setSearch,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-lg overflow-x-auto"
  >
    {/* Controls */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
      <div className="flex items-center bg-white/10 px-3 py-2 rounded-md w-full sm:w-auto">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white flex-1 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          className="bg-white/10 px-3 py-2 rounded-md text-white"
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
        >
          <option className="text-black" value="name">
            Name
          </option>
          <option className="text-black" value="email">
            Email
          </option>
          <option className="text-black" value="created">
            Joined
          </option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 bg-white/10 rounded-md hover:bg-white/20"
        >
          {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
        </button>
      </div>
    </div>

    {/* Table */}
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/20 text-gray-300">
          {[
            "Avatar",
            "Name",
            "Email",
            "Phone",
            "Education",
            "Interest",
            "Game",
            "Status",
            "Joined",
          ].map((head, i) => (
            <th key={i} className="p-3">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <motion.tr
            key={u.id}
            whileHover={{ scale: 1.01 }}
            className="border-b border-white/10 hover:bg-white/5 transition"
          >
            <td className="p-3">
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </td>
            <td className="p-3">{u.name}</td>
            <td className="p-3">{u.email}</td>
            <td className="p-3">{u.phoneNumber}</td>
            <td className="p-3">{u.educationDegree}</td>
            <td className="p-3">{u.areaOfInterest}</td>
            <td className="p-3">{u.favoriteGame}</td>
            <td className="p-3">
              {u.verified ? (
                <span className="text-green-400 font-semibold">Verified</span>
              ) : (
                <span className="text-gray-400">Unverified</span>
              )}
            </td>
            <td className="p-3">{new Date(u.created).toLocaleDateString()}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);

export default AdminDashboard;
