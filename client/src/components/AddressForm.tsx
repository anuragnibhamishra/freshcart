import { XIcon } from "lucide-react"

const AddressForm = ({
    resetForm,
    handleSubmit,
    form,
    setForm,
    editingId
}: any) => {
    return (
        <>
            {/* overlay */}
            <div className="fixed inset-0 bg-black/40 z-50" />

            {/* form container */}
            <div onClick={resetForm} className="fixed inset-0 z-50 flex-center p-4">
                <form
                    onSubmit={handleSubmit} onClick={e => e.stopPropagation()}
                    className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in"
                >
                    {/* form header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-app-green">
                            {editingId ? "Edit Address" : "Add New Address"}
                        </h2>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="p-2 hover:bg-app-cream rounded-lg"
                        >
                            <XIcon className="size-5" />
                        </button>
                    </div>
                    {/* form input fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                Label
                            </label>
                            <input
                                type="text"
                                placeholder="Home, Work, etc."
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                Address
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                City
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">
                                State
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none"
                                value={form.state}
                                onChange={(e) => setForm({ ...form, state: e.target.value })}
                            />
                        </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default AddressForm