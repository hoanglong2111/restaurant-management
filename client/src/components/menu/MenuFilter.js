// src/components/menu/MenuFilter.js
import React from 'react';
import { Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined, CalendarOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * MenuFilter renders the search input, category selector, and "Đặt Bàn" button.
 * Props:
 *  - searchTerm: current search string
 *  - onSearch: function(value) called when search is performed or changed
 *  - categories: array of category strings
 *  - selectedCategory: currently selected category
 *  - onCategoryChange: function(value) called when category changes
 *  - onEatAtTable: function() called when the "Đặt Bàn" button is clicked
 */
const MenuFilter = ({
    searchTerm,
    onSearch,
    categories,
    selectedCategory,
    onCategoryChange,
    onEatAtTable,
}) => {
    return (
        <div className="menu-filter-section">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={24} md={8}>
                    <Search
                        placeholder="Tìm kiếm món ăn..."
                        enterButton={<SearchOutlined style={{ fontSize: '18px', color: '#ffffff' }} />}
                        size="large"
                        value={searchTerm}
                        onSearch={onSearch}
                        allowClear
                        onChange={e => onSearch(e.target.value)}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Select
                        placeholder="Chọn danh mục"
                        size="large"
                        style={{ width: '100%' }}
                        value={selectedCategory}
                        onChange={onCategoryChange}
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
                    <Button type="primary" size="large" onClick={onEatAtTable} icon={<CalendarOutlined />} block>
                        Đặt Bàn
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default MenuFilter;
