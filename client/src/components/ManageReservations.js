// File: client/src/components/ManageReservations.js
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Modal, Form, Select, Alert, Spin, DatePicker, Checkbox, Space, message } from 'antd';
import axiosInstance from './axiosInstance';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/vi';
import '../CSS/ManageReservations.css';
dayjs.extend(customParseFormat);
dayjs.locale('vi');

function ManageReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [selectedDate, setSelectedDate] = useState(null); // Initialize as null
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [filterMode, setFilterMode] = useState('date'); // 'date', 'month', 'year'
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([
        'ID Đặt Chỗ',
        'Người Dùng',
        'Bàn',
        'Ngày Đặt',
        'Số Người',
        'Trạng Thái',
        'Hành Động',
    ]);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        try {
            let params = {};

            if (selectedDate) { // Only add filters if a date is selected
                let formattedDate;
                switch (filterMode) {
                    case 'month':
                        formattedDate = selectedDate.format('YYYY-MM');
                        params.month = formattedDate;
                        break;
                    case 'year':
                        formattedDate = selectedDate.format('YYYY');
                        params.year = formattedDate;
                        break;
                    case 'date':
                    default:
                        formattedDate = selectedDate.format('YYYY-MM-DD');
                        params.date = formattedDate;
                }
            }

            const { data } = await axiosInstance.get('reservations', { params });
            setReservations(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lấy danh sách đặt chỗ thất bại');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, filterMode]);

    useEffect(() => {
        fetchReservations();

        // Real-time clock update every second
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [fetchReservations]);

    const showModal = (reservation) => {
        form.setFieldsValue({
            id: reservation._id,
            status: reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1),
        });
        setIsModalVisible(true);
    };

    const handleOk = () => {
        form.submit();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setError('');
    };

    const onFinish = async (values) => {
        try {
            const reservationEnd = dayjs(values.reservationDate).add(2, 'hour').toDate();
            await axiosInstance.put(`reservations/${values.id}`, { 
                status: values.status.toLowerCase(),
                reservationEnd 
            });
            Modal.success({
                title: 'Cập Nhật Trạng Thái Đặt Chỗ Thành Công',
            });
            setIsModalVisible(false);
            fetchReservations(); // Refresh reservations list
            form.resetFields();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Cập nhật đặt chỗ thất bại');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`reservations/${id}`);
            Modal.success({
                title: 'Xóa Đặt Chỗ Thành Công',
            });
            fetchReservations();
        } catch (err) {
            setError(err.response?.data?.message || 'Xóa đặt chỗ thất bại');
        }
    };

    // Bulk delete
    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 đặt chỗ');
            return;
        }

        const selectedReservations = reservations.filter(res => selectedRowKeys.includes(res._id));

        Modal.confirm({
            title: `Xác nhận xóa ${selectedRowKeys.length} đặt chỗ`,
            content: (
                <div>
                    <p style={{ marginBottom: 12 }}>Bạn có chắc chắn muốn xóa các đặt chỗ đã chọn?</p>
                    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                        {selectedReservations.map((res, index) => (
                            <div key={res._id} style={{ marginBottom: 4 }}>
                                {index + 1}. <strong>{res.user?.name || 'Khách hàng'}</strong> - Bàn {res.table?.tableNumber || 'N/A'} - {dayjs(res.reservationDate).format('DD/MM/YYYY HH:mm')}
                            </div>
                        ))}
                    </div>
                </div>
            ),
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            width: 600,
            onOk: async () => {
                try {
                    await Promise.all(selectedRowKeys.map(id => axiosInstance.delete(`reservations/${id}`)));
                    message.success(`Đã xóa ${selectedRowKeys.length} đặt chỗ`);
                    setSelectedRowKeys([]);
                    fetchReservations();
                } catch (err) {
                    message.error('Có lỗi xảy ra khi xóa');
                }
            },
        });
    };

    // Bulk update status
    const handleBulkUpdateStatus = (status) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 đặt chỗ');
            return;
        }

        const selectedReservations = reservations.filter(res => selectedRowKeys.includes(res._id));
        const statusMap = {
            'confirmed': 'Hoàn Thành',
            'pending': 'Đang Chờ',
            'cancelled': 'Đã Hủy'
        };

        Modal.confirm({
            title: `Cập nhật ${selectedRowKeys.length} đặt chỗ`,
            content: (
                <div>
                    <p style={{ marginBottom: 12 }}>Đổi trạng thái thành <strong>"{statusMap[status.toLowerCase()]}"</strong>?</p>
                    <div style={{ maxHeight: 200, overflowY: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                        {selectedReservations.map((res, index) => (
                            <div key={res._id} style={{ marginBottom: 4 }}>
                                {index + 1}. <strong>{res.user?.name || 'Khách hàng'}</strong> - Bàn {res.table?.tableNumber || 'N/A'} - Trạng thái: {res.status}
                            </div>
                        ))}
                    </div>
                </div>
            ),
            okText: 'Cập nhật',
            cancelText: 'Hủy',
            width: 600,
            onOk: async () => {
                try {
                    await Promise.all(selectedRowKeys.map(id => 
                        axiosInstance.put(`reservations/${id}`, { status: status.toLowerCase() })
                    ));
                    message.success(`Đã cập nhật ${selectedRowKeys.length} đặt chỗ`);
                    setSelectedRowKeys([]);
                    fetchReservations();
                } catch (err) {
                    message.error('Có lỗi xảy ra khi cập nhật');
                }
            },
        });
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
        ],
    };

    const columns = [
        {
            title: 'ID Đặt Chỗ',
            dataIndex: '_id',
            key: '_id',
            visible: visibleColumns.includes('ID Đặt Chỗ'),
        },
        {
            title: 'Người Dùng',
            dataIndex: ['user', 'name'],
            key: 'userName',
            visible: visibleColumns.includes('Người Dùng'),
        },
        {
            title: 'Bàn',
            dataIndex: ['table', 'tableNumber'],
            key: 'tableNumber',
            visible: visibleColumns.includes('Bàn'),
        },
        {
            title: 'Ngày Đặt',
            dataIndex: 'reservationDate',
            key: 'reservationDate',
            render: (date) => dayjs(date).format('HH:mm:ss DD-MM-YYYY'),
            visible: visibleColumns.includes('Ngày Đặt'),
        },
        {
            title: 'Số Người',
            dataIndex: 'numberOfGuests',
            key: 'numberOfGuests',
            visible: visibleColumns.includes('Số Người'),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status.charAt(0).toUpperCase() + status.slice(1),
            visible: visibleColumns.includes('Trạng Thái'),
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (text, record) => (
                <>
                    <Button type="link" style={{ fontSize: '12px' }} onClick={() => showModal(record)}>Cập Nhật</Button>
                    <Button type="link" danger style={{ fontSize: '12px' }} onClick={() => handleDelete(record._id)}>Xóa</Button>
                </>
            ),
            visible: visibleColumns.includes('Hành Động'),
        },
    ].filter(column => column.visible);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleFilterModeChange = (value) => {
        setFilterMode(value);
        setSelectedDate(null); // Reset selectedDate when filter mode changes
    };

    const handleColumnsChange = (checkedValues) => {
        setVisibleColumns(checkedValues);
    };

    if (loading) return <div className="manage-reservations-spin"><Spin tip="Đang tải..." /></div>;
    if (error && !isModalVisible) return <div className="manage-reservations-alert"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;

    return (
        <div className="manage-reservations-container">
            <h2 className="manage-reservations-title">Quản Lý Đặt Chỗ</h2>

            <div className="manage-reservations-actions">
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <Select value={filterMode} onChange={handleFilterModeChange} className="manage-reservations-select">
                        <Select.Option value="date">Ngày</Select.Option>
                        <Select.Option value="month">Tháng</Select.Option>
                        <Select.Option value="year">Năm</Select.Option>
                    </Select>
                    <DatePicker
                        value={selectedDate}
                        format={filterMode === 'year' ? 'YYYY' : filterMode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'}
                        picker={filterMode}
                        onChange={handleDateChange}
                        allowClear
                    />
                </div>
                <div className="current-time">
                    <strong>Thời gian:</strong> {currentTime.format('HH:mm:ss')} - {currentTime.format('DD-MM-YYYY')}
                </div>
            </div>

            <div className="column-selector" style={{ marginBottom: 16 }}>
                <strong>Chọn cột:</strong>
                <Checkbox.Group
                    options={[
                        { label: 'ID', value: 'ID Đặt Chỗ' },
                        { label: 'Người Dùng', value: 'Người Dùng' },
                        { label: 'Bàn', value: 'Bàn' },
                        { label: 'Ngày', value: 'Ngày Đặt' },
                        { label: 'Số Người', value: 'Số Người' },
                        { label: 'Trạng Thái', value: 'Trạng Thái' },
                        { label: 'Hành Động', value: 'Hành Động' },
                    ]}
                    value={visibleColumns}
                    onChange={handleColumnsChange}
                />
            </div>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions-bar">
                    <Space wrap>
                        <span style={{ marginRight: 8 }}>
                            Đã chọn <strong>{selectedRowKeys.length}</strong> đặt chỗ
                        </span>
                        <Button 
                            type="primary" 
                            onClick={() => handleBulkUpdateStatus('confirmed')}
                        >
                            Hoàn thành
                        </Button>
                        <Button onClick={() => handleBulkUpdateStatus('pending')}>
                            Đang chờ
                        </Button>
                        <Button onClick={() => handleBulkUpdateStatus('cancelled')}>
                            Hủy bỏ
                        </Button>
                        <Button danger onClick={handleBulkDelete}>
                            Xóa
                        </Button>
                    </Space>
                </div>
            )}

            <div className="manage-reservations-table">
                <Table
                    dataSource={reservations}
                    columns={columns}
                    rowKey="_id"
                    rowSelection={rowSelection}
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <Modal
                title="Cập Nhật Trạng Thái Đặt Chỗ"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Lưu"
                cancelText="Hủy"
            >
                {error && <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="id"
                        label="ID Đặt Chỗ"
                        rules={[{ required: true, message: 'Vui lòng nhập ID đặt chỗ' }]}
                    >
                        <input type="text" disabled />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Trạng Thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Select.Option value="pending">Đang Chờ</Select.Option>
                            <Select.Option value="confirmed">Đã Xác Nhận</Select.Option>
                            <Select.Option value="cancelled">Đã Hủy</Select.Option>
                            <Select.Option value="completed">Hoàn Thành</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ManageReservations;