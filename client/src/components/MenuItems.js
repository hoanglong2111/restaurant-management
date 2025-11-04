import React, { useState, useEffect } from 'react';
import { Spin, Alert, Button, Modal, Carousel, Card, Row, Col, Input, Select, Form, DatePicker, InputNumber } from 'antd';
import { SearchOutlined, FilterOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ShoppingCartOutlined, CreditCardOutlined, UserOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import '../CSS/MenuItems.css';
import axiosInstance from './axiosInstance'; // Import axiosInstance for API calls
import '../CSS/global.css';
const { Search } = Input;
const { Option } = Select;

function MenuItems({ addToCart }) { // Nhận addToCart từ props
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // State for Reservation Modal
    const [isReserveModalVisible, setIsReserveModalVisible] = useState(false);
    const [availableTables, setAvailableTables] = useState([]);
    const [reservationForm] = Form.useForm();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [reservationData, setReservationData] = useState(null);
    const [reservationError, setReservationError] = useState('');

    useEffect(() => {
        const fetchMenuItems = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get('menu'); // Sử dụng axiosInstance
                const sanitizedData = data.map(item => ({
                    ...item,
                    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
                }));
                setMenuItems(sanitizedData);
                setFilteredItems(sanitizedData);
                const uniqueCategories = [...new Set(sanitizedData.map(item => item.category))];
                setCategories(uniqueCategories);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching menu items.');
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const handleSearch = (value) => {
        setSearchTerm(value);
        filterItems(value, selectedCategory);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        filterItems(searchTerm, value);
    };

    const filterItems = (search, category) => {
        let items = [...menuItems];
        if (search) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (category) {
            items = items.filter(item => item.category === category);
        }
        setFilteredItems(items);
    };

    const showModal = (item) => {
        setSelectedItem(item);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedItem(null);
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart(selectedItem); // Sử dụng addToCart từ props
            setIsModalVisible(false);
            setSelectedItem(null);
            Modal.success({
                title: 'Thêm vào giỏ hàng',
                content: `${selectedItem.name} đã được thêm vào giỏ hàng.`,
            });
        }
    };

    const handleCheckout = () => {
        // Chuyển hướng đến trang thanh toán
        window.location.href = '/cart';
    };

    const handleEatAtTable = () => {
        setIsReserveModalVisible(true);
        // fetchAvailableTables(); // Bạn có thể thêm tham số ngày nếu cần
    };

    // Fetch available tables for reservation
    const fetchAvailableTables = async (date) => {
        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD HH:mm:ss');
            const response = await axiosInstance.get('tables', {
                params: { reservationDate: formattedDate },
            });
            setAvailableTables(response.data);
            setLoading(false);
        } catch (err) {
            setReservationError(err.response?.data?.message || 'Error fetching available tables.');
            setLoading(false);
        }
    };

    // Gọi khi người dùng chọn ngày đặt bàn
    const handleDateChange = (date) => {
        if (date) {
            fetchAvailableTables(date);
        }
    };

    const handleReserveCancel = () => {
        setIsReserveModalVisible(false);
        reservationForm.resetFields();
        setReservationError('');
    };

    const handleReserveSubmit = () => {
        reservationForm
            .validateFields()
            .then(values => {
                setReservationData(values);
                setIsConfirmModalVisible(true);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleConfirm = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const reservationPayload = {
                user: currentUser._id, // Thêm trường này
                table: reservationData.table,
                reservationDate: reservationData.date.format('YYYY-MM-DD HH:mm:ss'),
                numberOfGuests: reservationData.guests,
                status: 'confirmed',
            };
            await axiosInstance.post('reservations', reservationPayload);
            // Cập nhật danh sách bàn có sẵn sau khi đặt thành công
            fetchAvailableTables(reservationData.date);
            setIsConfirmModalVisible(false);
            setIsReserveModalVisible(false);
            reservationForm.resetFields();
            setReservationData(null);
            Modal.success({
                title: 'Đặt bàn thành công',
                content: 'Bạn đã đặt bàn thành công. Vui lòng kiểm tra email để nhận xác nhận.',
            });
        } catch (err) {
            setIsConfirmModalVisible(false);
            Modal.error({
                title: 'Đặt bàn thất bại',
                content: err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đặt bàn.',
            });
        }
    };

    const handleConfirmCancel = () => {
        setIsConfirmModalVisible(false);
        setReservationData(null);
    };

    if (loading) return <Spin tip="Đang tải..." />;
    if (error) return <Alert message="Lỗi" description={error} type="error" showIcon />;

    return (
        <div className="menu-items">
            {/* Banner Section */}
            <div className="menu-banner">
                <div className="menu-banner-overlay">
                    <h1 className="menu-title">Thực Đơn</h1>
                </div>
            </div>

            {/* Filter Section */}
            <div className="menu-filter-section">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={24} md={8}>
                        <Search
                            placeholder="Tìm kiếm món ăn..."
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            allowClear
                            prefix={<SearchOutlined style={{ color: '#999' }} />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select
                            placeholder="Chọn danh mục"
                            size="large"
                            style={{ width: '100%' }}
                            onChange={handleCategoryChange}
                            allowClear
                            suffixIcon={<FilterOutlined />}
                        >
                            {categories.map(category => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleEatAtTable}
                            icon={<CalendarOutlined />}
                            block
                        >
                            Đặt Bàn
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Menu Items Grid */}
            <div className="menu-items-container">
                <Row gutter={[24, 24]}>
                    {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                        <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
                            <Card
                                hoverable
                                className="menu-card"
                                cover={
                                    item.imageUrls && item.imageUrls.length > 0 ? (
                                        <img alt={item.name} src={item.imageUrls[0]} className="menu-image" />
                                    ) : (
                                        <div className="menu-image menu-image-placeholder">
                                            <span className="placeholder-icon">🍽️</span>
                                        </div>
                                    )
                                }
                                actions={[
                                    <Button
                                        type="link"
                                        onClick={() => showModal(item)}
                                        icon={<EyeOutlined />}
                                    >
                                        Xem Chi Tiết
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={item.name}
                                    description={
                                        <div className="menu-card-info">
                                            <div className="menu-price">
                                                {item.price.toLocaleString()} VND
                                            </div>
                                            <div className="menu-category-tag">
                                                {item.category}
                                            </div>
                                            <div className={`menu-availability ${item.availability ? 'in-stock' : 'out-of-stock'}`}>
                                                {item.availability ? (
                                                    <><CheckCircleOutlined /> Còn hàng</>
                                                ) : (
                                                    <><CloseCircleOutlined /> Hết hàng</>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <div className="empty-state">
                            <SearchOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                            <h3>Không tìm thấy món ăn nào</h3>
                            <p>Vui lòng thử tìm kiếm với từ khóa khác</p>
                        </div>
                    </Col>
                )}
                </Row>
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <Modal
                    open={isModalVisible}
                    onCancel={handleCancel}
                    width={700}
                    className="menu-detail-modal"
                    centered
                    footer={
                        <div className="modal-footer-custom">
                            <Button
                                key="addToCart"
                                size="large"
                                onClick={handleAddToCart}
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                block
                            >
                                Thêm Vào Giỏ Hàng
                            </Button>
                            <div className="modal-footer-row">
                                <Button
                                    key="eatAtTable"
                                    size="large"
                                    onClick={handleEatAtTable}
                                    icon={<CalendarOutlined />}
                                    style={{ flex: 1 }}
                                >
                                    Đặt Bàn
                                </Button>
                                <Button
                                    key="checkout"
                                    size="large"
                                    onClick={handleCheckout}
                                    icon={<CreditCardOutlined />}
                                    style={{ flex: 1 }}
                                >
                                    Thanh Toán
                                </Button>
                            </div>
                        </div>
                    }
                >
                    {selectedItem.imageUrls && selectedItem.imageUrls.length > 0 ? (
                        <Carousel autoplay dotPosition="bottom">
                            {selectedItem.imageUrls.map((url, index) => (
                                <div key={index}>
                                    <img src={url} alt={selectedItem.name} className="menu-image" />
                                </div>
                            ))}
                        </Carousel>
                    ) : (
                        <div className="menu-image menu-image-placeholder">
                            <span className="placeholder-icon">🍽️</span>
                        </div>
                    )}
                    <h3 className="menu-item-name">{selectedItem.name}</h3>
                    <div className="menu-item-price">{selectedItem.price.toLocaleString()} VND</div>
                    <div className="menu-item-meta">
                        <span className="menu-item-category">
                            Danh mục: <strong>{selectedItem.category}</strong>
                        </span>
                        <span className={`menu-item-availability ${selectedItem.availability ? 'in-stock' : 'out-of-stock'}`}>
                            {selectedItem.availability ? (
                                <><CheckCircleOutlined /> Còn hàng</>
                            ) : (
                                <><CloseCircleOutlined /> Hết hàng</>
                            )}
                        </span>
                    </div>
                    <div className="menu-item-description">
                        {selectedItem.description || 'Món ăn ngon, được chế biến từ nguyên liệu tươi ngon.'}
                    </div>
                </Modal>
            )}

            {/* Reservation Form Modal */}
            <Modal
                title="Đặt Bàn"
                open={isReserveModalVisible}
                onOk={handleReserveSubmit}
                onCancel={handleReserveCancel}
                okText="Đặt Bàn"
                cancelText="Hủy"
                className="reserve-modal"
                width={600}
                okButtonProps={{
                    size: 'large',
                    type: 'primary'
                }}
                cancelButtonProps={{
                    size: 'large'
                }}
            >
                {reservationError && (
                    <Alert
                        message="Lỗi"
                        description={reservationError}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                <Form
                    form={reservationForm}
                    layout="vertical"
                    name="reservationForm"
                >
                    <Form.Item
                        name="date"
                        label="Ngày và Giờ"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày đặt' }]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            size="large"
                            onChange={handleDateChange}
                            placeholder="Chọn ngày và giờ"
                            suffixIcon={<ClockCircleOutlined />}
                        />
                    </Form.Item>
                    <Form.Item
                        name="guests"
                        label="Số Lượng Khách"
                        rules={[{ required: true, message: 'Vui lòng nhập số người' }]}
                    >
                        <InputNumber
                            min={1}
                            max={20}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Nhập số lượng khách"
                            prefix={<TeamOutlined />}
                        />
                    </Form.Item>
                    <Form.Item
                        name="table"
                        label="Chọn Bàn"
                        rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
                    >
                        <Select
                            placeholder="Chọn bàn phù hợp"
                            showSearch
                            size="large"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {availableTables.length > 0 ? (
                                availableTables.map(table => (
                                    <Option key={table._id} value={table._id}>
                                        Bàn #{table.tableNumber} - {table.location} - Sức chứa: {table.capacity} người
                                    </Option>
                                ))
                            ) : (
                                <Option disabled>Không có bàn trống</Option>
                            )}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                title="Xác Nhận Đặt Bàn"
                open={isConfirmModalVisible}
                onOk={handleConfirm}
                onCancel={handleConfirmCancel}
                okText="Xác Nhận"
                cancelText="Quay Lại"
                className="reserve-modal"
                okButtonProps={{
                    size: 'large',
                    type: 'primary'
                }}
                cancelButtonProps={{
                    size: 'large'
                }}
            >
                {reservationData && (
                    <div className="confirmation-content">
                        <div className="confirmation-item">
                            <ClockCircleOutlined className="confirmation-icon" />
                            <div>
                                <div className="confirmation-label">Ngày Đặt</div>
                                <div className="confirmation-value">{reservationData.date.format('DD/MM/YYYY HH:mm')}</div>
                            </div>
                        </div>
                        <div className="confirmation-item">
                            <TeamOutlined className="confirmation-icon" />
                            <div>
                                <div className="confirmation-label">Số Người</div>
                                <div className="confirmation-value">{reservationData.guests} người</div>
                            </div>
                        </div>
                        <div className="confirmation-item">
                            <UserOutlined className="confirmation-icon" />
                            <div>
                                <div className="confirmation-label">Bàn Số</div>
                                <div className="confirmation-value">#{
                                    availableTables.find(table => table._id === reservationData.table)?.tableNumber
                                }</div>
                            </div>
                        </div>
                        <div className="confirmation-note">
                            Bạn có chắc chắn rằng các thông tin trên đã chính xác?
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MenuItems;