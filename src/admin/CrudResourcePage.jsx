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
            New
          </button>
        </div>
      </div>

      {note ? <div className="alert alert-info">{note}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <h3 className="h5 mb-0">Records</h3>
          <span className="badge text-bg-primary">{rows.length} rows</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-secondary">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-center text-secondary">{emptyMessage}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isSelected = row.id && row.id === selectedId;

                    return (
                      <tr key={row.id} className={isSelected ? "table-primary" : ""}>
                        {columns.map((column) => (
                          <td key={`${row.id}-${column.key}`}>{column.render ? column.render(row) : row[column.key]}</td>
                        ))}
                        <td>
                          <button type="button" className="btn btn-sm btn-link p-0" onClick={() => onSelectRow(row)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isFormOpen ? (
        <>
          <div className="modal-backdrop-shell" onClick={onCloseForm} />
          <div className="modal d-block modal-shell" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}>
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <div>
                    <div className="text-uppercase text-secondary small fw-semibold">
                      {selectedId ? "Edit record" : "Create record"}
                    </div>
                    <h3 className="modal-title h5 mb-0">{title}</h3>
                  </div>
                  <button type="button" className="btn-close" aria-label="Close" onClick={onCloseForm} />
                </div>

                <form onSubmit={onSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      {fields.map((field) => {
                        const value = formState[field.name];

                        if (field.type === "checkbox") {
                          return (
                            <div className="col-12" key={field.name}>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(event) => onChangeField(field.name, event.target.checked)}
                                  id={field.name}
                                />
                                <label className="form-check-label" htmlFor={field.name}>
                                  {field.label}
                                </label>
                              </div>
                            </div>
                          );
                        }

                        if (field.type === "select") {
                          return (
                            <div className="col-12 col-md-6" key={field.name}>
                              <label className="form-label">{field.label}</label>
                              <select
                                className="form-select"
                                value={value ?? ""}
                                onChange={(event) => onChangeField(field.name, event.target.value)}
                              >
                                <option value="">Select...</option>
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
                              <label className="form-label">{field.label}</label>
                              <textarea
                                className="form-control"
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
                            <label className="form-label">{field.label}</label>
                            <input
                              className="form-control"
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

                  <div className="modal-footer d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary" onClick={onCloseForm}>
                      Close
                    </button>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-danger" onClick={onDeleteSelected} disabled={!selectedId || saving}>
                        Delete
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
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
