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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const email = sessionStorage.getItem("admin_email");
        const password = sessionStorage.getItem("admin_password");

        if (!email || !password) {
          navigate("/admin");
          return;
        }

        await pb.admins.authWithPassword(email, password);
        const response = await pb.collection("users").getList(1, 30, {
          sort: "-created",
        });
        setData(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const users = useMemo(() => data?.items || [], [data]);

  const totalUsers = data?.totalItems || 0;
  const verifiedUsers = users.filter((u) => u.verified).length;
  const verifiedPercent = totalUsers
    ? ((verifiedUsers / totalUsers) * 100).toFixed(1)
    : 0;
  const newUsersThisMonth = users.filter((u) => {
    const created = new Date(u.created);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  const topInterest = useMemo(() => {
    const counts = {};
    users.forEach((u) => {
      if (u.areaOfInterest)
        counts[u.areaOfInterest] = (counts[u.areaOfInterest] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [users]);

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

  const filtered = users
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

  const handleLogout = () => {
    pb.authStore.clear();
    sessionStorage.clear();
    navigate("/admin");
  };

  if (loading)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-linear-to-b from-black via-[#0b0b14] to-black text-white px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-green-300 to-blue-300 text-center sm:text-left"
        >
          Admin Dashboard
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition text-sm sm:text-base"
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
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
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
      >
        <ChartCard title="Education Distribution" icon={<GraduationCap />}>
          <ResponsiveContainer width="100%" height={250}>
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={interestData}>
              <XAxis dataKey="name" tick={{ fill: "white" }} />
              <YAxis tick={{ fill: "white" }} />
              <Tooltip />
              <Bar dataKey="value" fill="#34d399" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top 5 Favorite Games" icon={<Gamepad2 />}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              layout="vertical"
              data={favoriteGameData}
              margin={{ left: 80, right: 20 }}
            >
              <XAxis type="number" tick={{ fill: "white" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "white" }}
                width={120}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e1e2f", border: "none" }}
                itemStyle={{ color: "#a78bfa" }}
              />
              <Bar dataKey="value" fill="#a78bfa" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth Over Time" icon={<TrendingUp />}>
          <ResponsiveContainer width="100%" height={250}>
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
      </motion.div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20 backdrop-blur-lg overflow-x-auto"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <div className="flex items-center bg-white/10 px-3 py-2 rounded-md w-full sm:w-auto">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white flex-1 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              className="bg-white/10 px-3 py-2 rounded-md text-white text-sm sm:text-base"
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
              className="p-2 bg-white/10 rounded-md"
            >
              {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b border-white/20 text-gray-300">
                <th className="p-3">Avatar</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3 hidden md:table-cell">Phone</th>
                <th className="p-3 hidden md:table-cell">Education</th>
                <th className="p-3 hidden lg:table-cell">Interest</th>
                <th className="p-3 hidden lg:table-cell">Game</th>
                <th className="p-3">Status</th>
                <th className="p-3 hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
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
                  <td className="p-3 hidden md:table-cell">{u.phoneNumber}</td>
                  <td className="p-3 hidden md:table-cell">
                    {u.educationDegree}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    {u.areaOfInterest}
                  </td>
                  <td className="p-3 hidden lg:table-cell">{u.favoriteGame}</td>
                  <td className="p-3">
                    {u.verified ? (
                      <span className="text-green-400 font-semibold">
                        Verified
                      </span>
                    ) : (
                      <span className="text-gray-400">Unverified</span>
                    )}
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    {new Date(u.created).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

/* 🔹 Components */
const MetricCard = ({ title, value, subText, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-green-400/20 transition-all text-center sm:text-left"
  >
    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
      <div className="p-2 bg-white/10 rounded-lg text-green-300">{icon}</div>
      <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
    </div>
    <p className="text-2xl sm:text-3xl font-bold">{value}</p>
    {subText && <p className="text-gray-400 text-sm mt-1">{subText}</p>}
  </motion.div>
);

const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20 shadow-lg backdrop-blur-lg">
    <div className="flex items-center gap-2 mb-3 text-gray-300 font-semibold text-sm sm:text-base">
      {icon} <span>{title}</span>
    </div>
    {children}
  </div>
);

export default AdminDashboard;
