export default {
  saveRecord(record) {
    const records = this.getRecords();
    records.push(record);
    localStorage.setItem("proteinRecords", JSON.stringify(records));
  },

  getRecords() {
    const storedRecords = localStorage.getItem("proteinRecords");
    return storedRecords ? JSON.parse(storedRecords) : [];
  },

  updateRecords(updatedRecords) {
    localStorage.setItem("proteinRecords", JSON.stringify(updatedRecords));
  },

  deleteRecord(recordId) {
    let records = this.getRecords();
    const index = records.findIndex((record) => record.id === recordId);
    if (index !== -1) {
      records.splice(index, 1);
      this.updateRecords(records);
    }
  },
};
