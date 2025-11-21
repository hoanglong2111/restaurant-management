import React, { useEffect, useState, useCallback } from 'react';
import { Table, Alert, Spin, DatePicker, Card, Typography, Row, Col } from 'antd';
import axiosInstance from './axiosInstance';
import MobileBackButton from './MobileBackButton';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/vi';
import '../CSS/Reservations.css'; // Import the Reservations.css
import '../CSS/global.css';
dayjs.extend(customParseFormat);
dayjs.locale('vi');

const { Title } = Typography;

function Reservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = selectedDate
                ? { date: selectedDate.format('YYYY-MM-DD') }
                : {};
            
            // Check if user is admin
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const endpoint = user && user.isAdmin ? 'reservations' : 'reservations/my';
            
            const { data } = await axiosInstance.get(endpoint, { params });
            setReservations(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể lấy danh sách đặt chỗ.');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const columns = [
        { title: 'ID Đặt Chỗ', dataIndex: '_id', key: '_id' },
        { title: 'Người Dùng', dataIndex: ['user', 'name'], key: 'userName' },
        { title: 'Bàn', dataIndex: ['table', 'tableNumber'], key: 'tableNumber' },
        { 
            title: 'Ngày Đặt', 
            dataIndex: 'reservationDate', 
            key: 'reservationDate',
            render: (date) => dayjs(date).format('HH:mm:ss DD-MM-YYYY'),
        },
        { title: 'Số Người', dataIndex: 'numberOfGuests', key: 'numberOfGuests' },
        { 
            title: 'Trạng Thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                const statusMap = {
                    pending: <span className="status-pending">Đang Chờ</span>,
                    confirmed: <span className="status-confirmed">Đã Xác Nhận</span>,
                    cancelled: <span className="status-cancelled">Đã Hủy</span>,
                    completed: <span className="status-completed">Hoàn Thành</span>,
                };
                return statusMap[status] || status;
            },
        },
    ];

    return (
        <div className="reservations">
            <MobileBackButton to="/menu" label="Quay về Menu" />

            <Card className="reservations-card">
                <Row justify="space-between" align="middle" className="reservations-header">
                    <Col xs={24} sm={12}>
                        <Title level={2} className="reservations-title">Danh Sách Đặt Chỗ</Title>
                    </Col>
                    <Col xs={24} sm={12} className="date-picker-col">
                        <DatePicker
                            value={selectedDate}
                            format="YYYY-MM-DD"
                            onChange={handleDateChange}
                            className="reservations-date-picker"
                            allowClear
                            placeholder="Chọn ngày"
                        />
                    </Col>
                </Row>
                {loading ? (
                    <Spin className="reservations-spin" />
                ) : error ? (
                    <Alert message="Lỗi" description={error} type="error" showIcon className="reservations-alert" />
                ) : (
                    <Table
                        dataSource={reservations}
                        columns={columns}
                        rowKey="_id"
                        pagination={{ pageSize: 10 }}
                        className="reservations-table"
                        bordered
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </Card>
        </div>
    );
}

export default Reservations;