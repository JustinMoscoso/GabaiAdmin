import { useState, useMemo } from "react";

function CrudResourcePage({
  title,
  description,
  resourceLabel,
  rows,
  columns,
  fields,
  formState,
  loading,
  saving,
  error,
  selectedId,
  isFormOpen,
  onSelectRow,
  onChangeField,
  onSubmit,
  onDeleteSelected,
  onNew,
  onCloseForm,
  emptyMessage = "No records found.",
  note,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sorting logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtering and Sorting processed data
  const filteredAndSortedRows = useMemo(() => {
    let items = [...rows];

    // Search filter
    if (searchTerm) {
      items = items.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig.key) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return items;
  }, [rows, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedRows.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRows.slice(start, start + rowsPerPage);
  }, [filteredAndSortedRows, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="admin-page container-fluid px-0">
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-3">
        <div>
          <div className="text-uppercase text-primary fw-semibold small">{resourceLabel}</div>
          <h2 className="mb-1 fw-bold">{title}</h2>
          <p className="text-secondary mb-0">{description}</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-primary" onClick={onNew}>
            <i className="bi bi-plus-lg me-1"></i> New
          </button>
        </div>
      </div>

      {note ? <div className="alert alert-info py-2 px-3 small">{note}</div> : null}
      {error ? <div className="alert alert-danger py-2 px-3 small">{error}</div> : null}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
            <h3 className="h5 mb-0 d-flex align-items-center">
              Records
              <span className="badge bg-light text-primary border ms-2 rounded-pill font-monospace small">
                {filteredAndSortedRows.length}
              </span>
            </h3>
            
            <div className="input-group" style={{ maxWidth: "350px" }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary border-start-0" 
                  type="button" 
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary mt-2">Loading data...</p>
            </div>
          ) : filteredAndSortedRows.length === 0 ? (
            <div className="p-5 text-center">
              <i className="bi bi-inbox display-4 text-muted mb-3 d-block"></i>
              <p className="text-secondary">{searchTerm ? "No results match your search." : emptyMessage}</p>
              {searchTerm && (
                <button className="btn btn-sm btn-link" onClick={() => setSearchTerm("")}>Clear search</button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      {columns.map((column) => (
                        <th 
                          key={column.key} 
                          className="user-select-none cursor-pointer text-nowrap"
                          onClick={() => requestSort(column.key)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            {column.label}
                            <span className="ms-1">
                              {sortConfig.key === column.key ? (
                                sortConfig.direction === 'asc' ? <i className="bi bi-sort-alpha-down"></i> : <i className="bi bi-sort-alpha-up"></i>
                              ) : (
                                <i className="bi bi-arrow-down-up text-muted small opacity-50"></i>
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="text-end pe-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => {
                      const isSelected = row.id && row.id === selectedId;

                      return (
                        <tr key={row.id} className={isSelected ? "table-primary" : ""}>
                          {columns.map((column) => (
                            <td key={`${row.id}-${column.key}`}>
                              <div className="text-truncate" style={{ maxWidth: "250px" }}>
                                {column.render ? column.render(row) : row[column.key]}
                              </div>
                            </td>
                          ))}
                          <td className="text-end pe-3">
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onSelectRow(row)}>
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top d-flex justify-content-between align-items-center py-3">
                  <div className="small text-secondary">
                    Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedRows.length)} of {filteredAndSortedRows.length}
                  </div>
                  <nav aria-label="Table navigation">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i+1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isFormOpen ? (
        <>
          <div className="modal-backdrop-shell" onClick={onCloseForm} />
          <div className="modal d-block modal-shell" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}>
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light border-bottom">
                  <div>
                    <div className="text-uppercase text-secondary small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05rem' }}>
                      {selectedId ? "Update existing" : "Create new"}
                    </div>
                    <h3 className="modal-title h5 mb-0 fw-bold">{title}</h3>
                  </div>
                  <button type="button" className="btn-close" aria-label="Close" onClick={onCloseForm} />
                </div>

                <form onSubmit={onSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      {fields.map((field) => {
                        const value = formState[field.name];

                        if (field.type === "checkbox") {
                          return (
                            <div className="col-12" key={field.name}>
                              <div className="form-check form-switch bg-light p-3 rounded border">
                                <input
                                  className="form-check-input ms-0 me-2"
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(event) => onChangeField(field.name, event.target.checked)}
                                  id={field.name}
                                />
                                <label className="form-check-label fw-semibold" htmlFor={field.name}>
                                  {field.label}
                                </label>
                              </div>
                            </div>
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <div className="col-12 col-md-6" key={field.name}>
                              <label className="form-label fw-semibold small text-muted text-uppercase">{field.label}</label>
                              <select
                                className="form-select shadow-sm"
                                value={value ?? ""}
                                onChange={(event) => onChangeField(field.name, event.target.value)}
                              >
                                <option value="">Select an option...</option>
                                {field.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (field.type === "textarea") {
                          return (
                            <div className="col-12" key={field.name}>
                              <label className="form-label fw-semibold small text-muted text-uppercase">{field.label}</label>
                              <textarea
                                className="form-control shadow-sm"
                                rows={field.rows ?? 4}
                                value={value ?? ""}
                                onChange={(event) => onChangeField(field.name, event.target.value)}
                                placeholder={field.placeholder}
                              />
                            </div>
                          );
                        }

                        return (
                          <div className="col-12 col-md-6" key={field.name}>
                            <label className="form-label fw-semibold small text-muted text-uppercase">{field.label}</label>
                            <input
                              className="form-control shadow-sm"
                              type={field.type ?? "text"}
                              value={value ?? ""}
                              onChange={(event) => onChangeField(field.name, event.target.value)}
                              placeholder={field.placeholder}
                              readOnly={field.readOnly}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="modal-footer bg-light border-top d-flex justify-content-between p-3">
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={onCloseForm}>
                      Cancel
                    </button>
                    <div className="d-flex gap-2">
                      {selectedId && (
                        <button type="button" className="btn btn-outline-danger px-3" onClick={onDeleteSelected} disabled={saving}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={saving}>
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default CrudResourcePage;

