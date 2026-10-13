// Reuse the same named-field update behavior across all Dashboard forms.
export default function useFormChange(setForm) {
  return (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };
}
