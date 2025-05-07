import React from 'react';
import { Table } from 'antd';

export const DataTable = ({ data, columns, pagination = { pageSize: 10 } }) => {
  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={pagination}
      rowKey={(record) => record.id || record.key || Math.random()}
      className="w-full"
    />
  );
}; 