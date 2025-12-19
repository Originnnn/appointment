export default function Table({ 
  columns, // [{ key: 'name', label: 'Tên', render: (value, row) => <>{value}</> }]
  data,
  emptyMessage = "Không có dữ liệu",
  responsive = true,
  hoverable = true
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // Desktop table view
  const DesktopTable = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 hidden md:block">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={hoverable ? "hover:bg-blue-50 transition-colors duration-150" : ""}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render 
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile card view
  const MobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.map((row, rowIndex) => (
        <div 
          key={rowIndex}
          className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
        >
          {columns.map((column) => (
            <div key={column.key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-semibold text-gray-700 text-sm">{column.label}:</span>
              <span className="text-gray-900 text-sm text-right flex-1 ml-2">
                {column.render 
                  ? column.render(row[column.key], row, rowIndex)
                  : row[column.key]
                }
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return responsive ? (
    <>
      <DesktopTable />
      <MobileCards />
    </>
  ) : (
    <DesktopTable />
  );
}
