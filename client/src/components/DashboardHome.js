import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, ShoppingOutlined, CalendarOutlined } from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from './axiosInstance';
import MobileBackButton from './MobileBackButton';
import '../CSS/DashboardHome.css';

function DashboardHome() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalReservations: 0,
        totalTables: 0,
        availableTables: 0,
        occupiedTables: 0,
        totalRevenue: 0,
        recentOrders: [],
        reservationsByStatus: [],
        menuByCategory: [],
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [users, orders, reservations, tables, menuItems] = await Promise.all([
                axiosInstance.get('/users'),
                axiosInstance.get('/orders'),
                axiosInstance.get('/reservations'),
                axiosInstance.get('/tables'),
                axiosInstance.get('/menu'),
            ]);

            // Calculate statistics
            const totalRevenue = orders.data.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
            const availableTables = tables.data.filter(t => t.status === 'available').length;
            const occupiedTables = tables.data.filter(t => t.status === 'occupied').length;

            // Reservations by status
            const statusCount = {
                pending: 0,
                confirmed: 0,
                completed: 0,
                cancelled: 0,
            };
            reservations.data.forEach(r => {
                if (statusCount[r.status] !== undefined) {
                    statusCount[r.status]++;
                }
            });

            const reservationsByStatus = [
                { name: 'Chờ xác nhận', value: statusCount.pending, color: '#ff9800' },
                { name: 'Đã xác nhận', value: statusCount.confirmed, color: '#4caf50' },
                { name: 'Hoàn thành', value: statusCount.completed, color: '#2196f3' },
                { name: 'Đã hủy', value: statusCount.cancelled, color: '#f44336' },
            ];

            // Menu by category
            const categoryCount = {};
            menuItems.data.forEach(item => {
                categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
            });

            const menuByCategory = Object.keys(categoryCount).map(key => ({
                name: key,
                value: categoryCount[key],
            }));

            // Recent orders (last 7 days)
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                last7Days.push({
                    date: dateStr,
                    orders: 0,
                    revenue: 0,
                });
            }

            orders.data.forEach(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                const dayData = last7Days.find(d => d.date === orderDate);
                if (dayData) {
                    dayData.orders++;
                    dayData.revenue += order.totalPrice || 0;
                }
            });

            setStats({
                totalUsers: users.data.length,
                totalOrders: orders.data.length,
                totalReservations: reservations.data.length,
                totalTables: tables.data.length,
                availableTables,
                occupiedTables,
                totalRevenue,
                recentOrders: last7Days,
                reservationsByStatus,
                menuByCategory,
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    // Data for table status bar chart
    const tableStatusData = [
        {
            name: 'Trạng Thái Bàn',
            'Bàn Trống': stats.availableTables,
            'Đang Sử Dụng': stats.occupiedTables,
        },
    ];

    const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800'];

    return (
        <div className="dashboard-home">
            <h1 className="dashboard-title">Tổng Quan Hệ Thống</h1>

            <MobileBackButton to="/admin" label="Quay về Admin" />

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng Người Dùng"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1a1a1a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng Đơn Hàng"
                            value={stats.totalOrders}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1a1a1a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng Đặt Chỗ"
                            value={stats.totalReservations}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1a1a1a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Doanh Thu"
                            value={stats.totalRevenue}
                            suffix="VND"
                            valueStyle={{ color: '#1a1a1a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 1 */}
            <Row gutter={[16, 16]} className="charts-row">
                {/* Table Status Bar Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Trạng Thái Bàn" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tableStatusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Bàn Trống" fill="#4caf50" />
                                <Bar dataKey="Đang Sử Dụng" fill="#f44336" />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="table-summary">
                            <div className="summary-item">
                                <span className="summary-label">Tổng số bàn:</span>
                                <span className="summary-value">{stats.totalTables}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label available">Bàn trống:</span>
                                <span className="summary-value">{stats.availableTables}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label occupied">Đang sử dụng:</span>
                                <span className="summary-value">{stats.occupiedTables}</span>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Reservations Pie Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Trạng Thái Đặt Chỗ" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.reservationsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.reservationsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Charts Row 2 */}
            <Row gutter={[16, 16]} className="charts-row">
                {/* Revenue Line Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Doanh Thu 7 Ngày Gần Đây" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.recentOrders}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} name="Doanh thu (VND)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Menu Category Pie Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Món Ăn Theo Danh Mục" className="chart-card">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.menuByCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.menuByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default DashboardHome;

