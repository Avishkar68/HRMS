import Document from "../models/Document.model.js";

export const getDocuments = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { companyId: req.user.companyId };
    if (type) filter.type = type;

    const docs = await Document.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { name, type, description, fileUrl } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const doc = await Document.create({
      companyId: req.user.companyId,
      name: name.trim(),
      type: type || "other",
      description: description || "",
      fileUrl: fileUrl || "",
      uploadedBy: req.user.id,
    });
    const populated = await Document.findById(doc._id).populate("uploadedBy", "name email").lean();
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, fileUrl } = req.body;

    const doc = await Document.findOne({
      _id: id,
      companyId: req.user.companyId,
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (name) doc.name = name.trim();
    if (type) doc.type = type;
    if (description !== undefined) doc.description = description;
    if (fileUrl !== undefined) doc.fileUrl = fileUrl;
    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findOneAndDelete({
      _id: id,
      companyId: req.user.companyId,
    });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
