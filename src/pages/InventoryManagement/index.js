import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    DownloadOutlined,
    TagOutlined,
    SettingOutlined,
    BarcodeOutlined,
    EyeOutlined,
    LockOutlined,
    TeamOutlined,
    GlobalOutlined,
    PictureOutlined,
    PlusOutlined,
    UserOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    UploadOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    LinkOutlined,
    CopyOutlined,
    MailOutlined,
    PhoneOutlined,
    ReloadOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  Input,
  Radio,
  Table,
  Tag,
  Space,
  Image,
  Tooltip,
  Modal,
  Form,
  Row,
  Col,
  InputNumber,
  Select,
  Checkbox,
  Avatar,
  Empty,
  Spin,
  Upload,
  Alert,
  Card,
  Descriptions,
  DatePicker,
  Popconfirm,
} from "antd";
import { BACKEND_URL } from "../../config";

import {
    Image as ImageIcon,
    Visibility as VisibilityIcon,
    Add as AddIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Chat as ChatIcon,
    FilterList as FilterListIcon,
    Upload as UploadIcon,
    Download as DownloadIcon,
    Lock as LockIcon,
    Public as PublicIcon,
    Business as BusinessIcon,
} from "@mui/icons-material";
import API from "../../api";
import SimpleChatModal from "../../components/SimpleChatModal";
import useAuth from "../../hooks/useAuth";
import { Toast } from "../../components/Alerts/CustomToast";
import "./inventory.css";
import "../../assets/css/base.css";
import { ShareAltOutlined } from "@ant-design/icons";
import moment from "moment";

const Inventory = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
  const [size, setSize] = useState("large");
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    const [openModal, setOpenModal] = useState(false);

    // New state variables for separated inventory sections
    const [myProducts, setMyProducts] = useState([]);
    const [sharedWithDealers, setSharedWithDealers] = useState([]);
    const [privateProducts, setPrivateProducts] = useState([]);

    const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    refNo: "",
    condition: "New",
    status: "Available",
    priceListed: "",
    currency: "USD",
    description: "",
        images: [],
    visibility: "private", // 'private', 'public' (selected_admins hidden for new items)
    selectedAdmins: [], // Array of dealer IDs who can see the product
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreview, setImagePreview] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [detailModal, setDetailModal] = useState(false);
    const [contactModal, setContactModal] = useState(false);
    const [sharedDealersModal, setSharedDealersModal] = useState(false);
    const [selectedItemForDealers, setSelectedItemForDealers] = useState(null);
    // const [chatHistory, setChatHistory] = useState(false);
    // const [chatOpen, setChatOpen] = useState(false);

    // CSV Upload States
    const [csvUploadModal, setCsvUploadModal] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvUploading, setCsvUploading] = useState(false);
    const [csvUploadError, setCsvUploadError] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);

    // Multi-select and share functionality
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
    const [shareLoading, setShareLoading] = useState(false);

    // Selection mode state
    const [selectionMode, setSelectionMode] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState(null);

    // Admin selection state
    const [availableAdmins, setAvailableAdmins] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(false);
    const [loadingDealerDetails, setLoadingDealerDetails] = useState(new Set());

    // Wishlist state
    const [wishlist, setWishlist] = useState([]);
    const [wishlistModal, setWishlistModal] = useState(false);
    const [editingWishlistItem, setEditingWishlistItem] = useState(null);
    const [wishlistForm] = Form.useForm();

    const fetchInventory = async () => {
        setLoading(true);
        try {
      const res = await API.get("/api/inventory");
            const inventoryData = res.data.inventory || res.data || [];
      console.log("Fetched inventory data:", inventoryData);

            setInventory(inventoryData);
            setFilteredInventory(inventoryData);

            // Separate inventory into three categories
            if (!user) return;

      const myProductsData = inventoryData.filter((item) => {
        if (!item.createdBy) return false;
        return item.createdBy._id == user?._id;
      });

      console.log("My products:", myProductsData);
      console.log(
        "Products with selectedAdmins:",
        myProductsData.filter(
          (item) => item.selectedAdmins && item.selectedAdmins.length > 0
        )
      );

      const sharedWithDealersData = inventoryData.filter((item) => {
                if (!item.createdBy || !item.createdBy._id) return true;
        console.log(
          "UI console",
          item.createdBy._id != user._id,
          "++++++",
          item.createdBy._id,
          user._id
        );
        return item.createdBy._id != user._id;
      });
      const privateProductsData = myProductsData.filter(
        (item) => item.visibility == "private"
      );
            console.log(privateProductsData, "sharedWithDealersData");
            // console.log("myProductDATa", privateProductsData);

            setMyProducts(myProductsData);
            setSharedWithDealers(sharedWithDealersData);
            setPrivateProducts(privateProductsData);
        } catch (error) {
      console.error("Error fetching inventory:", error);
      Toast.error("Failed to load inventory data.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
        fetchAvailableAdmins();
    }, [user]);

    const fetchAvailableAdmins = async () => {
        setLoadingAdmins(true);
        try {
            // Fetch all dealers instead of just admins
      const res = await API.get("/api/admin/users?role=owner");
            const users = res.data.users || [];
      console.log("Fetched owner users:", users);

            // Also fetch all users to ensure we have complete dealer information
      const allUsersRes = await API.get("/api/admin/users");
            const allUsers = allUsersRes.data.users || [];
      console.log("Fetched all users:", allUsers);

            // Combine and deduplicate users, prioritizing owner role users
            const combinedUsers = [...users];
      allUsers.forEach((user) => {
        if (
          !combinedUsers.find((u) => u._id === user._id || u.id === user.id)
        ) {
                    combinedUsers.push(user);
                }
            });

            // Enhance user data with additional fields that might be available
      const enhancedUsers = combinedUsers.map((user) => ({
                ...user,
                // Map available fields to expected field names
        name:
          user.name || user.fullName || user.email?.split("@")[0] || "Unknown",
        fullName:
          user.fullName || user.name || user.email?.split("@")[0] || "Unknown",
        username: user.email?.split("@")[0] || "Unknown",
        company: user.company || user.companyId || "Not specified",
        phone: user.phone || "Not specified",
        location:
          user.city && user.country
            ? `${user.city}, ${user.country}`
            : user.city || user.country || "Not specified",
        role: user.role || "user",
      }));

      console.log("Combined users:", combinedUsers);
      console.log("Enhanced users:", enhancedUsers);
      console.log(
        "User IDs in combined array:",
        enhancedUsers.map((u) => ({
          _id: u._id,
          id: u.id,
          name: u.name || u.fullName || u.username,
        }))
      );

            setAvailableAdmins(enhancedUsers);
        } catch (error) {
      console.error("Error fetching dealers:", error);
      Toast.error("Failed to load available dealers.");
        }
        setLoadingAdmins(false);
    };

    // Function to fetch detailed user information for a specific user
    const fetchUserDetails = async (userId) => {
        try {
            const res = await API.get(`/api/admin/users/${userId}/details`);
            return res.data;
        } catch (error) {
            console.error(`Error fetching user details for ${userId}:`, error);
            // If the detailed endpoint fails, try to create a basic user object from the ID
            // This provides a fallback so users can still see something
            return {
                _id: userId,
                id: userId,
                name: `User ${userId.slice(-6)}`,
                fullName: `User ${userId.slice(-6)}`,
                username: `user_${userId.slice(-6)}`,
                email: `user_${userId.slice(-6)}@example.com`,
        company: "Company information unavailable",
        phone: "Phone information unavailable",
        location: "Location information unavailable",
        role: "user",
            };
        }
    };

    // Filter inventory based on search term and filter

    const handleSearchChange = (event) => {
        const value = event.target ? event.target.value : event;
    console.log("UI console Search term changed to:", value);
        setSearchTerm(value);

        // Filter inventory based on search term
        if (!value.trim()) {
            setFilteredInventory(inventory);
        } else {
      const filtered = inventory.filter((item) => {
                const searchLower = value.toLowerCase();
                return (
                    (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
                    (item.model && item.model.toLowerCase().includes(searchLower)) ||
                    (item.refNo && item.refNo.toLowerCase().includes(searchLower)) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
                    (item.year && item.year.toString().includes(searchLower)) ||
          (item.condition &&
            item.condition.toLowerCase().includes(searchLower)) ||
                    (item.status && item.status.toLowerCase().includes(searchLower))
                );
            });
            setFilteredInventory(filtered);
        }
    };

    const clearSearch = () => {
    setSearchTerm("");
        setFilteredInventory(inventory);
    };

    const handleOpenModal = () => {
    console.log("UI console Opening modal..."); // Debug log
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setFormData({
      brand: "",
      model: "",
      year: "",
      refNo: "",
      condition: "",
      status: "Available",
      priceListed: "",
      currency: "USD",
      description: "",
            images: [],
      visibility: "private", // Always private for new items
      selectedAdmins: [],
        });
        setImageFiles([]);
        setImagePreview([]);
        setSelectedItem(null);
    };

    const handleOpenDetailModal = (item) => {
        setSelectedItem(item);
        setDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setDetailModal(false);
        setSelectedItem(null);
    };

    const handleOpenContactModal = (item) => {
        setSelectedItem(item);
        setContactModal(true);
    };

    const handleCloseContactModal = () => {
        setContactModal(false);
        setSelectedItem(null);
    };

    // Wishlist functions
    const handleOpenWishlistModal = () => {
        setEditingWishlistItem(null);
        wishlistForm.resetFields();
        setWishlistModal(true);
    };

    const handleCloseWishlistModal = () => {
        setWishlistModal(false);
        setEditingWishlistItem(null);
        wishlistForm.resetFields();
    };

    const handleEditWishlistItem = (item) => {
        setEditingWishlistItem(item);
        wishlistForm.setFieldsValue({
            ...item,
      targetDate: item.targetDate ? moment(item.targetDate) : null,
        });
        setWishlistModal(true);
    };

    const handleDeleteWishlistItem = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
        Toast.success("Item removed from wishlist");
    };

    const handleWishlistSubmit = async () => {
        try {
            const values = await wishlistForm.validateFields();
            const itemData = {
                ...values,
                targetDate: values.targetDate ? values.targetDate.toISOString() : null,
        createdAt: editingWishlistItem
          ? editingWishlistItem.createdAt
          : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: editingWishlistItem ? editingWishlistItem.status : "pending",
                dealerId: user?._id,
        dealerName: user?.fullName || user?.name || user?.email?.split("@")[0],
            };

            if (editingWishlistItem) {
                // Update existing item
        setWishlist((prev) =>
          prev.map((item) =>
                    item.id === editingWishlistItem.id ? { ...item, ...itemData } : item
          )
        );
                Toast.success("Wishlist item updated successfully");
            } else {
                // Add new item
                const newItem = {
                    ...itemData,
                    id: Date.now().toString(),
          status: "pending",
                };
        setWishlist((prev) => [newItem, ...prev]);
                Toast.success("Item added to wishlist successfully");
            }

            handleCloseWishlistModal();
        } catch (error) {
            console.error("Form validation failed:", error);
        }
    };

    // Load wishlist from localStorage on component mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const handleOpenSharedDealersModal = async (item) => {
        setSelectedItemForDealers(item);
        setSharedDealersModal(true);

        // Debug logging to understand the data structure
    console.log("Opening Shared Dealers Modal for item:", item);
    console.log("Selected Admins:", item.selectedAdmins);
    console.log("Available Admins:", availableAdmins);

        // Log each dealer ID to see what we're looking for
        if (item.selectedAdmins && item.selectedAdmins.length > 0) {
      item.selectedAdmins.forEach((dealerId) => {
        const foundDealer = availableAdmins.find((d) => {
                    const dealerIdStr = dealerId.toString();
          const dId = (d._id || d.id || "").toString();
                    return dId === dealerIdStr;
                });
                console.log(`Looking for dealer ID: ${dealerId}, Found:`, foundDealer);

                // If dealer not found in availableAdmins, try to fetch detailed info
                if (!foundDealer) {
          console.log(
            `Dealer ${dealerId} not found, attempting to fetch details...`
          );
          fetchUserDetails(dealerId).then((detailedUser) => {
                        if (detailedUser) {
              console.log(
                `Fetched detailed user info for ${dealerId}:`,
                detailedUser
              );
                            // Update the availableAdmins array with the new user info
              setAvailableAdmins((prev) => {
                                const enhancedUser = {
                                    ...detailedUser,
                                    _id: detailedUser._id || detailedUser.id,
                  name:
                    detailedUser.name ||
                    detailedUser.fullName ||
                    detailedUser.email?.split("@")[0] ||
                    "Unknown",
                  fullName:
                    detailedUser.fullName ||
                    detailedUser.name ||
                    detailedUser.email?.split("@")[0] ||
                    "Unknown",
                  username: detailedUser.email?.split("@")[0] || "Unknown",
                  company:
                    detailedUser.company ||
                    detailedUser.companyId ||
                    "Not specified",
                  phone: detailedUser.phone || "Not specified",
                  location:
                    detailedUser.city && detailedUser.country
                      ? `${detailedUser.city}, ${detailedUser.country}`
                      : detailedUser.city ||
                        detailedUser.country ||
                        "Not specified",
                  role: detailedUser.role || "user",
                                };

                                // Check if user already exists
                const existingIndex = prev.findIndex(
                  (u) =>
                    (u._id || u.id)?.toString() ===
                    (detailedUser._id || detailedUser.id)?.toString()
                                );

                                if (existingIndex >= 0) {
                                    // Update existing user
                                    const updated = [...prev];
                                    updated[existingIndex] = enhancedUser;
                                    return updated;
                                } else {
                                    // Add new user
                                    return [...prev, enhancedUser];
                                }
                            });
                        }
                    });
                }
            });
        }
    };

    const handleCloseSharedDealersModal = () => {
        setSharedDealersModal(false);
        setSelectedItemForDealers(null);
    };

    const handleRemoveSharedDealer = async (dealerId) => {
        if (!selectedItemForDealers) return;

        try {
      const updatedSelectedAdmins =
        selectedItemForDealers.selectedAdmins.filter((id) => id !== dealerId);

            const submitData = new FormData();
      submitData.append(
        "selectedAdmins",
        JSON.stringify(updatedSelectedAdmins)
      );

            await API.put(`/api/inventory/${selectedItemForDealers._id}`, submitData);

      Toast.success("Dealer removed successfully!");

            // Update the local state
      setSelectedItemForDealers((prev) => ({
                ...prev,
        selectedAdmins: updatedSelectedAdmins,
            }));

            // Refresh inventory to update the UI
            fetchInventory();
        } catch (error) {
      console.error("Error removing dealer:", error);
      Toast.error("Failed to remove dealer.");
        }
    };

    const handleInputChange = (field, value) => {
    setFormData((prev) => ({
            ...prev,
      [field]: value,
        }));
    };

    const handleVisibilityChange = (visibility) => {
    setFormData((prev) => ({
            ...prev,
            visibility: visibility,
      selectedAdmins:
        visibility === "selected_admins" ? prev.selectedAdmins : [],
        }));
    };

    const handleAdminSelection = (adminId, isSelected) => {
    setFormData((prev) => ({
            ...prev,
            selectedAdmins: isSelected
                ? [...prev.selectedAdmins, adminId]
        : prev.selectedAdmins.filter((id) => id !== adminId),
        }));
    };

    const getVisibilityInfo = (item) => {
        const isOwner = item.createdBy?._id === user?._id;

        if (isOwner) {
            // User's own products - check visibility field from database
            if (item.visibility == "public") {
        return {
          label: "Fully Public",
          subLabel: "Your product",
          color: "green",
          icon: "public",
        };
      } else if (item.visibility == "selected_admins") {
        return {
          label: "Shared Dealers",
          subLabel: "Your product",
          color: "blue",
          icon: "team",
        };
      } else {
        return {
          label: "Private",
          subLabel: "Only you can see",
          color: "red",
          icon: "lock",
        };
            }
        } else {
            // Other people's products (Shared with Dealer section)
      const ownerName =
        item.createdBy?.name ||
        item.createdBy?.fullName ||
        item.createdByName ||
        "Unknown Owner";
      const ownerEmail = item.createdBy?.email || "No email";

      if (
        item.visibility === "selected_admins" &&
        item.selectedAdmins?.includes(user?._id)
      ) {
                return {
          label: "Shared with you",
                    subLabel: `Owner: ${ownerName}`,
          color: "blue",
          icon: "business",
                };
      } else if (item.visibility === "public") {
                return {
          label: "Public Product",
                    // subLabel: `Owner: ${ownerName}`,
          color: "green",
          icon: "public",
                };
            } else {
                // This shouldn't normally happen (private products shouldn't be visible to others)
                return {
          label: "Restricted",
                    subLabel: `Owner: ${ownerName}`,
          color: "gray",
          icon: "lock",
                };
            }
        }
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
    setImageFiles((prev) => [...prev, ...files]);

        // Create preview URLs
    files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
        setImagePreview((prev) => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
      brand: item.brand || "",
      model: item.model || "",
      year: item.year || "",
      refNo: item.refNo || "",
      condition: item.condition || "",
      status: item.status || "Available",
      priceListed: item.priceListed || "",
      currency: item.currency || "USD",
      description: item.description || "",
            images: item.images || [],
      visibility: item.visibility || "private",
      selectedAdmins: item.selectedAdmins || [],
        });
        setImageFiles([]);
        setImagePreview([]);
        setEditModal(true);
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;

        setDeleting(true);
        try {
            await API.delete(`/api/inventory/${selectedItem._id}`);
      Toast.success("Inventory item deleted successfully!");
            setDeleteModal(false);
            setSelectedItem(null);
            fetchInventory();
        } catch (error) {
      console.error("Error deleting inventory item:", error);
      Toast.error("Failed to delete inventory item.");
        }
        setDeleting(false);
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;

        setSubmitting(true);
        try {
            const submitData = new FormData();

            // Add form fields
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          if (key === "selectedAdmins") {
                        // Only include selectedAdmins if visibility is 'selected_admins'
            if (formData.visibility === "selected_admins") {
                            submitData.append(key, JSON.stringify(formData[key]));
              console.log("Adding selectedAdmins:", formData[key]);
                        }
                    } else {
                        submitData.append(key, formData[key]);
            console.log("Adding field:", key, "=", formData[key]);
                    }
                }
            });

            // Add image files
            imageFiles.forEach((file, index) => {
        submitData.append("images", file);
            });

            await API.put(`/api/inventory/${selectedItem._id}`, submitData);

      Toast.success("Inventory item updated successfully!");
            setEditModal(false);
            setSelectedItem(null);
            fetchInventory();
        } catch (error) {
      console.error("Error updating inventory item:", error);
      Toast.error("Failed to update inventory item.");
        }
        setSubmitting(false);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // Create FormData to handle file uploads
            const submitData = new FormData();

            // Add form fields from the form values
      Object.keys(values).forEach((key) => {
        if (key !== "images") {
          if (key === "selectedAdmins") {
                        // Only include selectedAdmins if visibility is 'selected_admins'
            if (values.visibility === "selected_admins") {
                            submitData.append(key, JSON.stringify(values[key]));
                        }
          } else if (key === "visibility") {
                        // Set visibility field directly
                        submitData.append(key, values[key]);
                    } else {
                        submitData.append(key, values[key]);
                    }
                }
            });

            // Add image files
            imageFiles.forEach((file, index) => {
        submitData.append("images", file);
            });

      await API.post("/api/inventory", submitData);

      Toast.success("Inventory item added successfully!");
            handleCloseModal();
            fetchInventory(); // Refresh the inventory list

            // Reset form data
            setFormData({
        brand: "",
        model: "",
        year: "",
        refNo: "",
        condition: "New",
        status: "Available",
        priceListed: "",
        currency: "USD",
        description: "",
                images: [],
        visibility: "private", // Always private for new items
        selectedAdmins: [],
            });
            setImageFiles([]);
            setImagePreview([]);
        } catch (error) {
      console.error("Error adding inventory item:", error);
      Toast.error("Failed to add inventory item.");
        }
        setSubmitting(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
      case "Available":
        return "success";
      case "Sold":
        return "error";
      case "Reserved":
        return "warning";
      case "In Transit":
        return "info";
      case "Under Repair":
        return "secondary";
      default:
        return "default";
        }
    };

    const getConditionColor = (condition) => {
        switch (condition) {
      case "New":
        return "success";
      case "Like New":
        return "info";
      case "Excellent":
        return "primary";
      case "Good":
        return "warning";
      case "Fair":
        return "secondary";
      case "Poor":
        return "error";
      default:
        return "default";
        }
    };

    // CSV Upload Functions
    const handleCsvFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) {
      setCsvUploadError("Please select a valid CSV file");
            return;
        }

    console.log("UI console Selected file details:", {
            name: file.name,
            size: file.size,
            type: file.type,
      lastModified: file.lastModified,
    });

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvUploadError(
        "Please select a valid CSV file (must have .csv extension)"
      );
            return;
        }

        // Accept various CSV MIME types
    const validMimeTypes = [
      "text/csv",
      "application/csv",
      "text/plain",
      "application/vnd.ms-excel",
    ];
        if (file.type && !validMimeTypes.includes(file.type)) {
      console.warn(
        "Unusual MIME type for CSV file:",
        file.type,
        "but proceeding anyway"
      );
        }

        setCsvFile(file);
        setCsvUploadError(null);

        // Preview CSV content
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");

            if (lines.length < 2) {
        setCsvUploadError(
          "CSV file must have at least a header row and one data row"
        );
                return;
            }

            // Parse CSV headers and first few rows for preview
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const previewRows = lines.slice(1, 4).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
                const row = {};
                headers.forEach((header, index) => {
          row[header] = values[index] || "";
                });
                return row;
            });

            setCsvPreview({ headers, previewRows });
        };

        reader.onerror = () => {
      setCsvUploadError("Failed to read CSV file");
        };

        reader.readAsText(file);
    };

    const handleCsvUpload = async () => {
        if (!csvFile) {
      setCsvUploadError("Please select a CSV file");
            return;
        }

        setCsvUploading(true);
        setCsvUploadError(null);

        try {
      console.log("UI console Starting CSV upload for file:", csvFile.name);
      console.log("UI console File details:", {
                name: csvFile.name,
                size: csvFile.size,
        type: csvFile.type,
            });

            const formData = new FormData();
      formData.append("csvFile", csvFile);

            // Log FormData contents
            for (let [key, value] of formData.entries()) {
        console.log("UI console FormData entry:", key, value);
            }

      console.log("UI console Making API request to /api/inventory/upload-csv");
      const response = await API.post("/api/inventory/upload-csv", formData);

      console.log("UI console CSV upload response:", response.data);

            if (response.data.message) {
                Toast.success(response.data.message);
                setCsvUploadModal(false);
                setCsvFile(null);
                setCsvPreview(null);
                fetchInventory(); // Refresh inventory
            } else {
        setCsvUploadError(response.data.error || "Failed to upload CSV file");
            }
        } catch (error) {
      console.error("CSV upload error:", error);
      console.error("Error response:", error.response);

      let errorMessage = "Failed to upload CSV file";

            if (error.response && error.response.data) {
                if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.errors) {
                    errorMessage = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join(", ")
                        : error.response.data.errors;
                }
            }

            setCsvUploadError(errorMessage);
        } finally {
            setCsvUploading(false);
        }
    };

    const handleCloseCsvModal = () => {
        setCsvUploadModal(false);
        setCsvFile(null);
        setCsvPreview(null);
        setCsvUploadError(null);
    };

    const downloadCsvTemplate = () => {
    const headers = [
      "brand",
      "model",
      "year",
      "refNo",
      "condition",
      "status",
      "priceListed",
      "currency",
      "description",
    ];
        const sampleData = [
      [
        "Rolex",
        "Submariner",
        "2020",
        "126610LN",
        "Excellent",
        "Available",
        "8500",
        "USD",
        "Classic dive watch in excellent condition",
      ],
      [
        "Omega",
        "Speedmaster",
        "2019",
        "311.30.42.30.01.005",
        "Good",
        "Available",
        "4200",
        "USD",
        "Moonwatch with original bracelet",
      ],
        ];

        const csvContent = [
      headers.join(","),
      ...sampleData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
        a.href = url;
    a.download = "inventory_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const downloadAllInventoryData = () => {
    const dataToDownload = searchTerm
      ? [...getFilteredMyProducts(), ...getFilteredSharedWithDealers()]
      : inventory;

        if (dataToDownload.length === 0) {
      Toast.error("No inventory data to download.");
            return;
        }

        const headers = [
      "Brand",
      "Model",
      "Year",
      "Ref No",
      "Condition",
      "Status",
      "Price Listed",
      "Currency",
      "Description",
        ];

        const csvContent = [
      headers.join(","),
      ...dataToDownload.map((item) =>
        [
          escapeCsvValue(item.brand || ""),
          escapeCsvValue(item.model || ""),
          escapeCsvValue(item.year || ""),
          escapeCsvValue(item.refNo || ""),
          escapeCsvValue(item.condition || ""),
          escapeCsvValue(item.status || ""),
          escapeCsvValue(item.priceListed || ""),
          escapeCsvValue(item.currency || ""),
          escapeCsvValue(item.description || ""),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
        a.href = url;
    a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    Toast.success("CSV file downloaded successfully!");
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
      Toast.error("Please select items to delete.");
            return;
        }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedItems.length} selected items?`
      )
    ) {
            return;
        }

        setDeleting(true);
        try {
      await API.post("/api/inventory/bulk-delete", { ids: selectedItems });
            Toast.success(`${selectedItems.length} items deleted successfully!`);
            setSelectedItems([]);
            setSelectAll(false);
            fetchInventory();
        } catch (error) {
      console.error("Error bulk deleting inventory items:", error);
      Toast.error("Failed to delete selected items.");
        }
        setDeleting(false);
    };

    const handleShareItem = async (itemId) => {
        setShareLoading(true);
        try {
            // Generate share URL using the item's _id directly instead of backend hash
            const shareUrl = `${window.location.origin}/inventory/share/${itemId}`;
            setShareLink(shareUrl);
            setShareModal(true);
        } catch (error) {
      console.error("Error generating share link:", error);
      Toast.error("Failed to generate share link.");
        }
        setShareLoading(false);
    };

    const copyShareLink = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        Toast.success("Share link copied to clipboard!");
      })
      .catch(() => {
        Toast.error("Failed to copy link to clipboard.");
        });
    };

    const closeShareModal = () => {
        setShareModal(false);
    setShareLink("");
    };

    // Long press handlers for selection mode
    const handleLongPressStart = (e, item) => {
        e.preventDefault();
        // Add visual feedback
        const row = e.currentTarget;
    row.classList.add("long-press-active");

        const timer = setTimeout(() => {
            setSelectionMode(true);
            setSelectedItems([item._id]);
      row.classList.remove("long-press-active");
      console.log("UI console Selection mode activated");
        }, 3000); // 3 seconds
        setLongPressTimer(timer);
    };

    const handleLongPressEnd = (e) => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
        // Remove visual feedback
        if (e && e.currentTarget) {
      e.currentTarget.classList.remove("long-press-active");
        }
    };

    const exitSelectionMode = () => {
        setSelectionMode(false);
        setSelectedItems([]);
        setSelectAll(false);

        // Clear any active long press
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        // Remove any visual feedback from all rows
    const activeRows = document.querySelectorAll(".long-press-active");
    activeRows.forEach((row) => row.classList.remove("long-press-active"));
    };

    // Helper function to escape CSV values
    const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

  // Derived filters/helpers
  const countryFilters = Array.from(
    new Set((inventory || []).map((it) => it.country).filter(Boolean))
  ).map((c) => ({ text: c, value: c }));
  const formatDisplayPrice = (record) => {
    const dp = record && record.displayPrice;
    if (dp && typeof dp.amount === "number" && dp.currency) {
      try {
        return `${dp.currency} ${Number(dp.amount).toLocaleString()}`;
      } catch (e) {
        return `${dp.currency} ${dp.amount}`;
      }
    }
    // fallback to original
    if (typeof record?.priceListed === "number" && record?.currency) {
      try {
        return `${record.currency} ${Number(
          record.priceListed
        ).toLocaleString()}`;
      } catch (e) {
        return `${record.currency} ${record.priceListed}`;
      }
    }
    return "-";
  };

    // Table columns configuration for antd Table
    const columns = [
        {
      title: "Image",
      dataIndex: "images",
      key: "images",
            width: 80,
      render: (images, record) =>
                Array.isArray(images) && images.length > 0 ? (
                    <Image
                        width={40}
                        height={40}
                        src={`${BACKEND_URL}/${images[0]}`}
                        alt={record.brand}
            style={{ borderRadius: "8px", objectFit: "cover" }}
                        fallback={
                            <div className="table-image-placeholder">
                                <ImageIcon />
                            </div>
                        }
                    />
                ) : (
                    <div className="table-image-placeholder">
                        <ImageIcon />
                    </div>
            ),
        },
        {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      render: (text) => text || "-",
      sorter: (a, b) => (a.brand || "").localeCompare(b.brand || ""),
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      render: (text) => text || "-",
      sorter: (a, b) => (a.model || "").localeCompare(b.model || ""),
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      render: (text) => text || "-",
            sorter: (a, b) => (a.year || 0) - (b.year || 0),
        },
        {
      title: "Ref No",
      dataIndex: "refNo",
      key: "refNo",
      render: (text) => text || "-",
      sorter: (a, b) => (a.refNo || "").localeCompare(b.refNo || ""),
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
            render: (condition) => (
        <Tag
          color={
            condition === "New"
              ? "success"
              : condition === "Like New"
              ? "blue"
              : condition === "Excellent"
              ? "green"
              : condition === "Good"
              ? "orange"
              : condition === "Fair"
              ? "default"
              : condition === "Poor"
              ? "error"
              : "default"
          }
        >
          {condition || "-"}
                </Tag>
            ),
            filters: [
        { text: "New", value: "New" },
        { text: "Like New", value: "Like New" },
        { text: "Excellent", value: "Excellent" },
        { text: "Good", value: "Good" },
        { text: "Fair", value: "Fair" },
        { text: "Poor", value: "Poor" },
            ],
            onFilter: (value, record) => record.condition === value,
        },
        {
      title: "Status",
      dataIndex: "status",
      key: "status",
            render: (status) => (
        <Tag
          color={
            status === "Available"
              ? "success"
              : status === "Sold"
              ? "error"
              : status === "Reserved"
              ? "warning"
              : status === "In Transit"
              ? "processing"
              : status === "Under Repair"
              ? "default"
              : "default"
          }
        >
          {status || "-"}
                </Tag>
            ),
            filters: [
        { text: "Available", value: "Available" },
        { text: "Sold", value: "Sold" },
        { text: "Reserved", value: "Reserved" },
        { text: "In Transit", value: "In Transit" },
        { text: "Under Repair", value: "Under Repair" },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
      title: "Price",
      dataIndex: "priceListed",
      key: "priceListed",
            render: (price, record) => (
        <span style={{ fontWeight: "600", color: "#28a745" }}>
          {price || "-"}
                </span>
            ),
            sorter: (a, b) => (a.priceListed || 0) - (b.priceListed || 0),
        },
        {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      render: (text) => text || "-",
            filters: [
        { text: "USD", value: "USD" },
        { text: "EUR", value: "EUR" },
        { text: "GBP", value: "GBP" },
        { text: "CHF", value: "CHF" },
        { text: "JPY", value: "JPY" },
            ],
            onFilter: (value, record) => record.currency === value,
        },
        {
      title: "Price (Your Currency)",
      key: "displayPrice",
      render: (_, record) => (
        <span style={{ fontWeight: "600", color: "#1f2937" }}>
          {formatDisplayPrice(record)}
        </span>
      ),
      sorter: (a, b) => {
        const av = a?.displayPrice?.amount ?? a?.priceListed ?? 0;
        const bv = b?.displayPrice?.amount ?? b?.priceListed ?? 0;
        return Number(av) - Number(bv);
      },
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      render: (text) => text || "-",
      filters: countryFilters,
      onFilter: (value, record) => record.country === value,
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
            render: (visibility, record) => {
                const visInfo = getVisibilityInfo(record);
                const isOwner = record.createdBy?._id === user?._id;
        const ownerName =
          record.createdBy?.name ||
          record.createdBy?.fullName ||
          record.createdByName ||
          "Unknown Owner";
        const ownerEmail = record.createdBy?.email || "No email";

                return (
                    <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                visInfo.color === "red"
                  ? "bg-red-100 text-red-600"
                  : visInfo.color === "blue"
                  ? "bg-blue-100 text-blue-600"
                  : visInfo.color === "green"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {visInfo.icon === "lock" ? (
                <LockIcon className="w-4 h-4" />
              ) : visInfo.icon === "business" ? (
                <BusinessIcon className="w-4 h-4" />
              ) : (
                <PublicIcon className="w-4 h-4" />
              )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span
                  className={`text-sm font-semibold ${
                    visInfo.color === "red"
                      ? "text-red-700"
                      : visInfo.color === "blue"
                      ? "text-blue-700"
                      : visInfo.color === "green"
                      ? "text-green-700"
                      : "text-gray-700"
                  } `}
                  onClick={
                    visInfo.label === "Shared Dealers"
                      ? () => handleOpenSharedDealersModal(record)
                      : undefined
                  }
                                >
                                    {visInfo.label}
                                </span>
                                {isOwner && (
                  <Tag color="blue" size="small">
                    Owner
                  </Tag>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                {isOwner ? "Your product" : `Owner: ${ownerName}`}
                            </span>
                            {!isOwner && ownerEmail && (
                <span className="text-xs text-gray-400">{ownerEmail}</span>
                            )}
                        </div>
                    </div>
                );
            },
            filters: [
        { text: "Private", value: "private" },
        { text: "Selected Admins", value: "selected_admins" },
        { text: "Public", value: "public" },
            ],
            onFilter: (value, record) => record.visibility === value,
        },
        {
      title: "Actions",
      key: "actions",
            width: 200,
            render: (_, record) => {
                const isOwner = record.createdBy?._id === user?._id;

                return (
                    <Space size="small">
                        {/* <Tooltip title="View Details">
                            <Button
                                type="text"
                                size="small"
                                icon={<VisibilityIcon style={{ fontSize: '1rem', color: "#2563eb" }} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDetailModal(record);
                                }}
                            />
                        </Tooltip> */}

                        {/* Only show Edit and Delete for owner's items */}
                        {isOwner && (
                            <>
                                {/* <Tooltip title="Edit Item">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditIcon style={{ fontSize: '1rem', color: '#16a34a' }} />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(record);
                                        }}
                                    />
                                </Tooltip> */}
                                {/* Only show Shared Dealers button when visibility is selected_admins */}
                {record.visibility === "selected_admins" && (
                                    <Tooltip title="Manage Shared Dealers">
                                        <Button
                                            type="text"
                                            size="small"
                      icon={
                        <TeamOutlined
                          style={{ fontSize: "1rem", color: "#1890ff" }}
                        />
                      }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenSharedDealersModal(record);
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                <Tooltip title="Delete Item">
                                    <Button
                                        type="text"
                                        size="small"
                    icon={
                      <DeleteIcon
                        style={{ fontSize: "1rem", color: "#dc3545" }}
                      />
                    }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(record);
                                        }}
                                        danger
                                    />
                                </Tooltip>
                            </>
                        )}

                        {/* Show Contact Info button for shared products */}
                        {!isOwner && (
                            <Tooltip title="Contact Owner">
                                <Button
                                    type="text"
                                    size="small"
                  icon={
                    <UserOutlined
                      style={{ fontSize: "1rem", color: "#1890ff" }}
                    />
                  }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenContactModal(record);
                                    }}
                                />
                            </Tooltip>
                        )}

                        <Tooltip title="Share Item">
                            <Button
                                type="text"
                                size="small"
                icon={<ShareAltOutlined style={{ fontSize: "1rem" }} />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleShareItem(record._id);
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    // Wishlist columns configuration
    // const wishlistColumns = [
    //     {
    //         title: 'Item',
    //         dataIndex: 'name',
    //         key: 'name',
    //         render: (text, record) => (
    //             <div>
    //                 <div style={{ fontWeight: 500 }}>{text}</div>
    //                 <div style={{ fontSize: "12px", color: "#666" }}>
    //                     {record.brand && `${record.brand} • `}{record.model}
    //                 </div>
    //             </div>
    //         ),
    //         sorter: (a, b) => a.name.localeCompare(b.name),
    //     },
    //     {
    //         title: 'Priority',
    //         dataIndex: 'priority',
    //         key: 'priority',
    //         render: (priority) => (
    //             <Tag color={
    //                 priority === 'low' ? 'green' :
    //                 priority === 'medium' ? 'orange' :
    //                 priority === 'high' ? 'red' :
    //                 priority === 'urgent' ? 'purple' : 'default'
    //             }>
    //                 {priority.charAt(0).toUpperCase() + priority.slice(1)}
    //             </Tag>
    //         ),
    //         filters: [
    //             { text: 'Low', value: 'low' },
    //             { text: 'Medium', value: 'medium' },
    //             { text: 'High', value: 'high' },
    //             { text: 'Urgent', value: 'urgent' }
    //         ],
    //         onFilter: (value, record) => record.priority === value,
    //     },
    //     {
    //         title: 'Budget',
    //         dataIndex: 'budget',
    //         key: 'budget',
    //         render: (budget) => (
    //             <div>
    //                 {budget ? `$${budget.toLocaleString()}` : "Not specified"}
    //             </div>
    //         ),
    //         sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
    //     },
    //     {
    //         title: 'Target Date',
    //         dataIndex: 'targetDate',
    //         key: 'targetDate',
    //         render: (date) => (
    //             <div>
    //                 {date ? moment(date).format("MMM DD, YYYY") : "No deadline"}
    //             </div>
    //         ),
    //         sorter: (a, b) => new Date(a.targetDate || 0) - new Date(b.targetDate || 0),
    //     },
    //     {
    //         title: 'Status',
    //         dataIndex: 'status',
    //         key: 'status',
    //         render: (status) => (
    //             <Tag color={
    //                 status === 'pending' ? 'orange' :
    //                 status === 'in_progress' ? 'blue' :
    //                 status === 'completed' ? 'green' :
    //                 status === 'cancelled' ? 'red' : 'default'
    //             }>
    //                 {status === 'in_progress' ? 'In Progress' : 
    //                  status.charAt(0).toUpperCase() + status.slice(1)}
    //             </Tag>
    //         ),
    //         filters: [
    //             { text: 'Pending', value: 'pending' },
    //             { text: 'In Progress', value: 'in_progress' },
    //             { text: 'Completed', value: 'completed' },
    //             { text: 'Cancelled', value: 'cancelled' }
    //         ],
    //         onFilter: (value, record) => record.status === value,
    //     },
    //     {
    //         title: 'Actions',
    //         key: 'actions',
    //         render: (_, record) => (
    //             <Space size="small">
    //                 <Tooltip title="Edit">
    //                     <Button
    //                         type="text"
    //                         icon={<EditOutlined />}
    //                         size="small"
    //                         onClick={() => handleEditWishlistItem(record)}
    //                     />
    //                 </Tooltip>
    //                 <Popconfirm
    //                     title="Remove from wishlist?"
    //                     description="Are you sure you want to remove this item?"
    //                     onConfirm={() => handleDeleteWishlistItem(record.id)}
    //                     okText="Yes"
    //                     cancelText="No"
    //                 >
    //                     <Tooltip title="Delete">
    //                         <Button
    //                             type="text"
    //                             danger
    //                             icon={<DeleteOutlined />}
    //                             size="small"
    //                         />
    //                     </Tooltip>
    //                 </Popconfirm>
    //             </Space>
    //         ),
    //     },
    // ];

    const getFilteredMyProducts = () => {
        if (!searchTerm.trim()) return myProducts;
    const filtered = myProducts.filter((item) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
                (item.model && item.model.toLowerCase().includes(searchLower)) ||
                (item.refNo && item.refNo.toLowerCase().includes(searchLower)) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
                (item.year && item.year.toString().includes(searchLower)) ||
        (item.condition &&
          item.condition.toLowerCase().includes(searchLower)) ||
                (item.status && item.status.toLowerCase().includes(searchLower))
            );
        });
    console.log(
      "UI console Filtered My Products:",
      filtered.length,
      "out of",
      myProducts.length
    );
        return filtered;
    };

    const getFilteredSharedWithDealers = () => {
        if (!searchTerm.trim()) return sharedWithDealers;
    const filtered = sharedWithDealers.filter((item) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
                (item.model && item.model.toLowerCase().includes(searchLower)) ||
                (item.refNo && item.refNo.toLowerCase().includes(searchLower)) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower)) ||
                (item.year && item.year.toString().includes(searchLower)) ||
        (item.condition &&
          item.condition.toLowerCase().includes(searchLower)) ||
                (item.status && item.status.toLowerCase().includes(searchLower))
            );
        });
    console.log(
      "UI console Filtered Shared Dealers:",
      filtered.length,
      "out of",
      sharedWithDealers.length
    );
        return filtered;
    };

    // Table row selection configuration
  const rowSelection = selectionMode
    ? {
        selectedRowKeys: selectedItems,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedItems(selectedRowKeys);
        },
        onSelect: (record, selected, selectedRows) => {
            if (selected) {
            setSelectedItems((prev) => [...prev, record._id]);
            } else {
            setSelectedItems((prev) => prev.filter((id) => id !== record._id));
            }
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
                // Select all items in the current table section
                const currentTableData = selectedRows || [];
            setSelectedItems(currentTableData.map((item) => item._id));
                setSelectAll(true);
            } else {
                setSelectedItems([]);
                setSelectAll(false);
            }
        },
      }
    : undefined;

    return (
        <>
            <div className="inventory-container">
                <div className="inventory-wrapper">
                    {/* Search and Filter Section */}
          <div
            className="search-filter-section"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
                        <div className="search-filter__row ui-filter_row">
              <div className="ui-search-between">
                                <div className="search-input-wrapper">
                                    <Input.Search
                                        placeholder="Search inventory..."
                                        variant="filled"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e)}
                                        onSearch={handleSearchChange}
                                        allowClear
                    style={{ width: "100%" }}
                                    />
                                </div>
                            </div>
                            <div className="inventory-header" style={{ marginBottom: 0 }}>
                                <div className="inventory-header__actions">
                  <Button
                    type="green"
                    icon={<UploadIcon />}
                    onClick={() => setCsvUploadModal(true)}
                    size={size}
                  >
                                        Upload CSV
                                    </Button>
                  <Button
                    type="green"
                    icon={<DownloadOutlined />}
                    onClick={downloadAllInventoryData}
                    size={size}
                  >
                                        Download CSV
                                    </Button>
                                    {selectionMode && (
                                        <>
                                            <Button
                        type="danger"
                                                size={size}
                                                onClick={exitSelectionMode}
                                            >
                                                <CloseIcon /> Exit Selection
                                            </Button>
                                            {selectedItems.length > 0 && (
                                                <Button
                          type="danger"
                                                    size={size}
                                                    onClick={handleBulkDelete}
                                                    disabled={deleting}
                                                >
                          {deleting
                            ? "Deleting..."
                            : `Delete Selected (${selectedItems.length})`}
                                                </Button>
                                            )}
                                        </>
                                    )}

                  <Button
                    type="primary"
                    icon={<AddIcon />}
                    onClick={handleOpenModal}
                    size={size}
                  >
                                        Add Inventory
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Results Counter */}
                    {!loading && searchTerm && (
                        <div className="search-results-counter">
              <p>
                Found{" "}
                {getFilteredMyProducts().length +
                  getFilteredSharedWithDealers().length}{" "}
                item
                {getFilteredMyProducts().length +
                  getFilteredSharedWithDealers().length !==
                1
                  ? "s"
                  : ""}
                                {searchTerm && ` matching "${searchTerm}"`}
                            </p>
              {getFilteredMyProducts().length +
                getFilteredSharedWithDealers().length >
                0 && (
                                <div className="search-results-breakdown">
                                    <span className="search-results-breakdown__item">
                                        My Products: {getFilteredMyProducts().length}
                                    </span>
                                    <span className="search-results-breakdown__item">
                                        Shared with Me: {getFilteredSharedWithDealers().length}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inventory Tables Display */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading inventory...</p>
                        </div>
                    ) : (
                        <div className="inventory-tables-container">
                            {/* My Products Section */}
                            <div className="inventory-section">
                                <div className="inventory-section__header">
                                    <h3 className="inventory-section__title">
                                        <BusinessIcon className="w-5 h-5 text-blue-600" />
                                        My Products ({getFilteredMyProducts().length})
                                    </h3>
                                    <p className="inventory-section__description">
                                        Items you have created and own
                                    </p>
                                </div>
                                {getFilteredMyProducts().length === 0 ? (
                                    <div className="empty-state">
                                        <ImageIcon />
                                        <h3 className="empty-state__title">No products yet</h3>
                                        <p className="empty-state__description">
                                            You haven't added any products to your inventory yet.
                                        </p>
                    <button
                      className="btn btn--primary"
                      onClick={handleOpenModal}
                    >
                                            <AddIcon /> Add Your First Product
                                        </button>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <Table
                                            columns={columns}
                      dataSource={getFilteredMyProducts().map((item) => ({
                                                ...item,
                                                key: item._id || item.id,
                                            }))}
                                            rowSelection={rowSelection}
                                            pagination={{
                                                pageSize: 10,
                                                showSizeChanger: true,
                                                showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                        pageSizeOptions: ["5", "10", "20", "50"],
                                            }}
                                            scroll={{ x: 1200 }}
                                            size="middle"
                                            bordered
                                            rowClassName={(record, index) => {
                        if (
                          selectionMode &&
                          selectedItems.includes(record._id)
                        ) {
                          return "ant-table-row-selected";
                        }
                        return "";
                                            }}
                                            onRow={(record, index) => ({
                                                onClick: () => {
                                                    if (!selectionMode) {
                                                        handleOpenDetailModal(record);
                                                    }
                                                },
                        onMouseDown: (e) =>
                          !selectionMode && handleLongPressStart(e, record),
                                                onMouseUp: (e) => handleLongPressEnd(e),
                                                onMouseLeave: (e) => handleLongPressEnd(e),
                        onTouchStart: (e) =>
                          !selectionMode && handleLongPressStart(e, record),
                                                onTouchEnd: (e) => handleLongPressEnd(e),
                                                onTouchCancel: (e) => handleLongPressEnd(e),
                        style: {
                          cursor: selectionMode ? "default" : "pointer",
                        },
                                            })}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Shared with Dealers Section */}
                            <div className="inventory-section">
                                <div className="inventory-section__header">
                                    <h3 className="inventory-section__title">
                                        <BusinessIcon className="w-5 h-5 text-green-600" />
                                        Shared with Dealer ({getFilteredSharedWithDealers().length})
                                    </h3>
                                    <p className="inventory-section__description">
                                        Products shared with you by other dealers
                                    </p>
                                </div>
                                {getFilteredSharedWithDealers().length === 0 ? (
                                    <div className="empty-state">
                                        <ImageIcon />
                                        <h3 className="empty-state__title">No shared products</h3>
                                        <p className="empty-state__description">
                                            No other dealers have shared products with you yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <Table
                                            columns={columns}
                      dataSource={getFilteredSharedWithDealers().map(
                        (item) => ({
                                                ...item,
                                                key: item._id || item.id,
                        })
                      )}
                                            rowSelection={rowSelection}
                                            pagination={{
                                                pageSize: 10,
                                                showSizeChanger: true,
                                                showQuickJumper: true,
                        showTotal: (total, range) =>
                          `${range[0]}-${range[1]} of ${total} items`,
                        pageSizeOptions: ["5", "10", "20", "50"],
                                            }}
                                            scroll={{ x: 1200 }}
                                            size="middle"
                                            bordered
                                            rowClassName={(record, index) => {
                        if (
                          selectionMode &&
                          selectedItems.includes(record._id)
                        ) {
                          return "ant-table-row-selected";
                        }
                        return "";
                                            }}
                                            onRow={(record, index) => ({
                                                onClick: () => {
                                                    if (!selectionMode) {
                                                        handleOpenDetailModal(record);
                                                    }
                                                },
                        onMouseDown: (e) =>
                          !selectionMode && handleLongPressStart(e, record),
                                                onMouseUp: (e) => handleLongPressEnd(e),
                                                onMouseLeave: (e) => handleLongPressEnd(e),
                        onTouchStart: (e) =>
                          !selectionMode && handleLongPressStart(e, record),
                                                onTouchEnd: (e) => handleLongPressEnd(e),
                                                onTouchCancel: (e) => handleLongPressEnd(e),
                        style: {
                          cursor: selectionMode ? "default" : "pointer",
                        },
                                            })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add Item Modal */}
                    <Modal
                        title="Add New Inventory Item"
                        open={openModal}
                        onCancel={handleCloseModal}
                        footer={null}
                        width="90%"
            style={{ maxWidth: "800px" }}
                        destroyOnClose
                    >
                        <Form
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={formData}
                            className="inventory-form"
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Brand"
                                        name="brand"
                    rules={[
                      { required: true, message: "Please enter brand name" },
                    ]}
                                    >
                                        <Input
                                            placeholder="Enter brand name"
                                            size="large"
                                            prefix={<TagOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Model"
                                        name="model"
                    rules={[
                      { required: true, message: "Please enter model name" },
                    ]}
                                    >
                                        <Input
                                            placeholder="Enter model name"
                                            size="large"
                                            prefix={<SettingOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                  <Form.Item label="Year" name="year">
                                        <InputNumber
                                            placeholder="Enter year"
                                            size="large"
                      style={{ width: "100%" }}
                                            min={1800}
                                            max={new Date().getFullYear() + 1}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                  <Form.Item label="Reference Number" name="refNo">
                                        <Input
                                            placeholder="Enter reference number"
                                            size="large"
                                            prefix={<BarcodeOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                  <Form.Item label="Condition" name="condition">
                                        <Select
                                            placeholder="Select condition"
                                            size="large"
                                            options={[
                        { value: "New", label: "New" },
                        { value: "Like New", label: "Like New" },
                        { value: "Excellent", label: "Excellent" },
                        { value: "Good", label: "Good" },
                        { value: "Fair", label: "Fair" },
                        { value: "Poor", label: "Poor" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        initialValue="Available"
                                    >
                                        <Select
                                            placeholder="Select status"
                                            size="large"
                                            options={[
                        { value: "Available", label: "Available" },
                        { value: "Sold", label: "Sold" },
                        { value: "Reserved", label: "Reserved" },
                        { value: "In Transit", label: "In Transit" },
                        { value: "Under Repair", label: "Under Repair" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                  <Form.Item label="Price Listed" name="priceListed">
                                        <InputNumber
                                            placeholder="Enter price"
                                            size="large"
                      style={{ width: "100%" }}
                                            min={0}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Currency"
                                        name="currency"
                                        initialValue="USD"
                                    >
                                        <Select
                                            placeholder="Select currency"
                                            size="large"
                                            options={[
                        { value: "USD", label: "USD" },
                        { value: "EUR", label: "EUR" },
                        { value: "GBP", label: "GBP" },
                        { value: "CHF", label: "CHF" },
                        { value: "JPY", label: "JPY" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                  <Form.Item label="Description" name="description">
                                        <Input.TextArea
                                            placeholder="Enter product description"
                                            rows={4}
                                            showCount
                                            maxLength={500}
                                        />
                                    </Form.Item>
                                </Col>

                                {/* Enhanced Visibility Controls */}
                                <Col xs={24}>
                                    <Form.Item
                                        label={
                                            <span className="visibility-label">
                                                <EyeOutlined /> Product Visibility
                                            </span>
                                        }
                                    >
                                        <Radio.Group
                                            value={formData.visibility}
                                            onChange={(e) => handleVisibilityChange(e.target.value)}
                                            className="visibility-options"
                                        >
                      <Space direction="vertical" style={{ width: "100%" }}>
                                                {/* Private Option */}
                                                <Radio value="private">
                                                    <div className="visibility-option">
                                                        <div className="visibility-icon private">
                                                            <LockOutlined />
                                                        </div>
                                                        <div className="visibility-content">
                                                            <div className="visibility-title">Private</div>
                              <div className="visibility-description">
                                Only you can see this product
                              </div>
                                                        </div>
                                                    </div>
                                                </Radio>

                                                {/* Selected Dealers Option - Hidden for new items */}
                                                {/* <Radio value="selected_admins">
                                                     <div className="visibility-option">
                                                         <div className="visibility-icon selected">
                                                             <TeamOutlined />
                                                         </div>
                                                         <div className="visibility-content">
                                                             <div className="visibility-title">Selected Company Dealers</div>
                                                             <div className="visibility-description">Choose specific company dealers who can see this product</div>
                                                         </div>
                                                     </div>
                                                 </Radio> */}

                                                {/* Public Option */}
                                                <Radio value="public">
                                                    <div className="visibility-option">
                                                        <div className="visibility-icon public">
                                                            <GlobalOutlined />
                                                        </div>
                                                        <div className="visibility-content">
                              <div className="visibility-title">
                                Fully Public
                              </div>
                              <div className="visibility-description">
                                All company admins and users can see this
                                product
                              </div>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            </Space>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>

                                <Col xs={24}>
                                    <Form.Item
                                        label={
                                            <span>
                                                <PictureOutlined /> Product Images
                                            </span>
                                        }
                                    >
                                        <Upload
                                            listType="picture-card"
                                            fileList={imageFiles.map((file, index) => ({
                                                uid: index,
                                                name: file.name,
                        status: "done",
                        url: imagePreview[index],
                                            }))}
                                            beforeUpload={() => false}
                                            onChange={({ fileList }) => {
                        const newFiles = fileList.map(
                          (item) => item.originFileObj || item
                        );
                                                setImageFiles(newFiles.filter(Boolean));
                                            }}
                                            multiple
                                            accept="image/*"
                                            maxCount={5}
                                        >
                                            {imageFiles.length < 5 && (
                                                <div>
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Upload</div>
                                                </div>
                                            )}
                                        </Upload>
                                        <div className="upload-hint">
                      Upload up to 5 images (JPG, PNG, GIF). Maximum file size:
                      5MB
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="form-actions">
                                <Space>
                                    <Button onClick={handleCloseModal} size="large">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting}
                                        size="large"
                                        icon={<PlusOutlined />}
                                    >
                    {submitting ? "Adding..." : "Add Item"}
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal
                        title={
                            <div className="delete-modal-header">
                <ExclamationCircleOutlined
                  style={{ color: "#ff4d4f", marginRight: 8 }}
                />
                                Delete Inventory Item
                            </div>
                        }
                        open={deleteModal}
                        onCancel={() => setDeleteModal(false)}
                        footer={null}
                        width={500}
                        destroyOnClose
                    >
                        <div className="delete-modal-content">
                            <Alert
                                message="Warning"
                                description="Are you sure you want to delete this inventory item? This action cannot be undone."
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            {selectedItem && (
                                <Card size="small" style={{ marginBottom: 16 }}>
                                    <Descriptions column={1} size="small">
                    <Descriptions.Item label="Brand">
                      {selectedItem.brand}
                    </Descriptions.Item>
                    <Descriptions.Item label="Model">
                      {selectedItem.model}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reference">
                      {selectedItem.refNo || "N/A"}
                    </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color={getStatusColor(selectedItem.status)}>
                                                {selectedItem.status}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Price">
                      {selectedItem.priceListed
                        ? `${selectedItem.priceListed} ${
                            selectedItem.currency || "USD"
                          }`
                        : "Not set"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            )}

                            <div className="delete-modal-actions">
                                <Space>
                                    <Button onClick={() => setDeleteModal(false)} size="large">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        danger
                                        onClick={confirmDelete}
                                        loading={deleting}
                                        size="large"
                                        icon={<DeleteOutlined />}
                                    >
                    {deleting ? "Deleting..." : "Delete Item"}
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </Modal>

                    {/* Edit Item Modal */}
                    <Modal
                        title={
                            <div className="edit-modal-header">
                <EditOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Edit Inventory Item
                            </div>
                        }
                        open={editModal}
                        onCancel={() => setEditModal(false)}
                        footer={null}
                        width={800}
                        className="edit-item-modal"
                    >
                        <Form layout="vertical" className="edit-form">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Brand" required>
                                        <Input
                                            value={formData.brand}
                      onChange={(e) =>
                        handleInputChange("brand", e.target.value)
                      }
                                            placeholder="Enter brand name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Model" required>
                                        <Input
                                            value={formData.model}
                      onChange={(e) =>
                        handleInputChange("model", e.target.value)
                      }
                                            placeholder="Enter model name"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Year">
                                        <InputNumber
                                            value={formData.year}
                      onChange={(value) => handleInputChange("year", value)}
                                            placeholder="Enter year"
                      style={{ width: "100%" }}
                                            min={1900}
                                            max={new Date().getFullYear() + 1}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Reference Number">
                                        <Input
                                            value={formData.refNo}
                      onChange={(e) =>
                        handleInputChange("refNo", e.target.value)
                      }
                                            placeholder="Enter reference number"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Condition">
                                        <Select
                                            value={formData.condition}
                      onChange={(value) =>
                        handleInputChange("condition", value)
                      }
                                            placeholder="Select condition"
                                            allowClear
                                        >
                                            <Select.Option value="New">New</Select.Option>
                                            <Select.Option value="Like New">Like New</Select.Option>
                                            <Select.Option value="Excellent">Excellent</Select.Option>
                                            <Select.Option value="Good">Good</Select.Option>
                                            <Select.Option value="Fair">Fair</Select.Option>
                                            <Select.Option value="Poor">Poor</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Status">
                                        <Select
                                            value={formData.status}
                      onChange={(value) => handleInputChange("status", value)}
                                            placeholder="Select status"
                                        >
                                            <Select.Option value="Available">Available</Select.Option>
                                            <Select.Option value="Sold">Sold</Select.Option>
                                            <Select.Option value="Reserved">Reserved</Select.Option>
                      <Select.Option value="In Transit">
                        In Transit
                      </Select.Option>
                      <Select.Option value="Under Repair">
                        Under Repair
                      </Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Price Listed">
                                        <InputNumber
                                            value={formData.priceListed}
                      onChange={(value) =>
                        handleInputChange("priceListed", value)
                      }
                                            placeholder="Enter price"
                      style={{ width: "100%" }}
                                            min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Currency">
                                        <Select
                                            value={formData.currency}
                      onChange={(value) => handleInputChange("currency", value)}
                                            placeholder="Select currency"
                                        >
                                            <Select.Option value="USD">USD</Select.Option>
                                            <Select.Option value="EUR">EUR</Select.Option>
                                            <Select.Option value="GBP">GBP</Select.Option>
                                            <Select.Option value="CHF">CHF</Select.Option>
                                            <Select.Option value="JPY">JPY</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item label="Description">
                                        <Input.TextArea
                                            value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                                            placeholder="Enter product description"
                                            rows={4}
                                        />
                                    </Form.Item>
                                </Col>

                                {/* Enhanced Visibility Controls */}
                                <Col xs={24}>
                                    <Form.Item label="Product Visibility">
                                        <div className="visibility-options">
                                            {/* Private Option */}
                                            <div
                        className={`visibility-option ${
                          formData.visibility === "private"
                            ? "selected private"
                            : ""
                        }`}
                        onClick={() => handleVisibilityChange("private")}
                                            >
                                                <div className="visibility-icon">
                                                    <LockOutlined />
                                                </div>
                                                <div className="visibility-content">
                                                    <h4>Private</h4>
                                                    <p>Only you can see this product</p>
                                                </div>
                                                <div className="visibility-radio">
                          {formData.visibility === "private" && (
                            <div className="radio-dot" />
                          )}
                                                </div>
                                            </div>

                                            {/* Selected Dealers Option */}
                                            <div
                        className={`visibility-option ${
                          formData.visibility === "selected_admins"
                            ? "selected selected-admins"
                            : ""
                        }`}
                        onClick={() =>
                          handleVisibilityChange("selected_admins")
                        }
                                            >
                                                <div className="visibility-icon">
                                                    <TeamOutlined />
                                                </div>
                                                <div className="visibility-content">
                                                    <h4>Selected Company Dealers</h4>
                          <p>
                            Choose specific company dealers who can see this
                            product
                          </p>
                                                </div>
                                                <div className="visibility-radio">
                          {formData.visibility === "selected_admins" && (
                            <div className="radio-dot" />
                          )}
                                                </div>
                                            </div>

                                            {/* Dealer Selection Panel */}
                      {formData.visibility === "selected_admins" && (
                                                <div className="admin-selection-panel">
                                                    <h5>Select Company Dealers</h5>
                                                    {loadingAdmins ? (
                                                        <div className="loading-admins">
                                                            <Spin size="small" />
                                                            <span>Loading dealers...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="admins-list">
                                                            {availableAdmins.length === 0 ? (
                                <Empty
                                  description="No company dealers available"
                                  size="small"
                                />
                                                            ) : (
                                                                <Checkbox.Group
                                                                    value={formData.selectedAdmins}
                                                                    onChange={(checkedValues) => {
                                                                        // Update the selectedAdmins array
                                    handleInputChange(
                                      "selectedAdmins",
                                      checkedValues
                                    );
                                                                    }}
                                                                >
                                                                    {availableAdmins.map((dealer) => (
                                    <div
                                      key={dealer.id || dealer._id}
                                      className="admin-item"
                                    >
                                                                            <Checkbox value={dealer.id || dealer._id}>
                                                                                <div className="admin-info">
                                          <div className="admin-name">
                                            {dealer.name || dealer.fullName}
                                          </div>
                                          <div className="admin-email">
                                            {dealer.email}
                                          </div>
                                                                                </div>
                                                                            </Checkbox>
                                                                        </div>
                                                                    ))}
                                                                </Checkbox.Group>
                                                            )}
                                                        </div>
                                                    )}
                                                    {formData.selectedAdmins.length > 0 && (
                                                        <div className="selected-count">
                              <CheckCircleOutlined
                                style={{ color: "#52c41a", marginRight: 8 }}
                              />
                              {formData.selectedAdmins.length} dealer
                              {formData.selectedAdmins.length !== 1
                                ? "s"
                                : ""}{" "}
                              selected
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Public Option */}
                                            <div
                        className={`visibility-option ${
                          formData.visibility === "public"
                            ? "selected public"
                            : ""
                        }`}
                        onClick={() => handleVisibilityChange("public")}
                                            >
                                                <div className="visibility-icon">
                                                    <GlobalOutlined />
                                                </div>
                                                <div className="visibility-content">
                                                    <h4>Fully Public</h4>
                          <p>
                            All company admins and users can see this product
                          </p>
                                                </div>
                                                <div className="visibility-radio">
                          {formData.visibility === "public" && (
                            <div className="radio-dot" />
                          )}
                                                </div>
                                            </div>
                                        </div>
                                    </Form.Item>
                                </Col>

                                {/* Product Images */}
                                <Col xs={24}>
                                    <Form.Item label="Product Images">
                    {selectedItem &&
                      selectedItem.images &&
                      selectedItem.images.length > 0 && (
                                            <div className="current-images">
                                                <h5>Current Images ({selectedItem.images.length})</h5>
                                                <div className="images-grid">
                                                    {selectedItem.images.map((image, index) => (
                                                        <div key={index} className="image-item">
                                                            <img
                                                                src={`${BACKEND_URL}/${image}`}
                                                                alt={`Current ${index + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="image-upload-section">
                                            <Upload
                                                multiple
                                                accept="image/*"
                                                beforeUpload={(file) => {
                                                    // Handle file upload for edit modal
                                                    const reader = new FileReader();
                                                    reader.onload = (e) => {
                            setImagePreview((prev) => [
                              ...prev,
                              e.target.result,
                            ]);
                                                    };
                                                    reader.readAsDataURL(file);
                                                    return false; // Prevent default upload
                                                }}
                                                showUploadList={false}
                                            >
                        <Button
                          icon={<UploadOutlined />}
                          className="upload-btn"
                        >
                                                    Add More Images
                                                </Button>
                                            </Upload>
                      <p className="upload-hint">
                        Upload additional images (JPG, PNG, GIF)
                      </p>
                                        </div>

                                        {imagePreview.length > 0 && (
                                            <div className="new-images">
                                                <h5>New Images ({imagePreview.length})</h5>
                                                <div className="images-grid">
                                                    {imagePreview.map((preview, index) => (
                                                        <div key={index} className="image-item">
                                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                className="remove-image-btn"
                                                                onClick={() => removeImage(index)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="modal-actions">
                <Button onClick={() => setEditModal(false)}>Cancel</Button>
                                <Button
                                    type="primary"
                                    onClick={handleUpdate}
                                    loading={submitting}
                                    icon={<EditOutlined />}
                                >
                  {submitting ? "Updating..." : "Update Item"}
                                </Button>
                            </div>
                        </Form>
                    </Modal>

                    {/* Detail Modal */}
                    <Modal
                        title={
                            <div className="detail-modal-header">
                <EyeOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Product Details
                            </div>
                        }
                        open={detailModal}
                        onCancel={handleCloseDetailModal}
                        footer={null}
                        width="90%"
            style={{ maxWidth: "900px" }}
                        destroyOnClose
                    >
                        {selectedItem && (
                            <div className="detail-modal-content">
                                <Row gutter={[32, 24]}>
                                    {/* Image Section */}
                                    <Col xs={24} md={12}>
                                        <div className="product-image-container">
                      {Array.isArray(selectedItem.images) &&
                      selectedItem.images.length > 0 ? (
                                                <Image
                                                    src={`${BACKEND_URL}/${selectedItem.images[0]}`}
                                                    alt={selectedItem.brand}
                                                    className="product-image"
                                                    fallback={
                                                        <div className="image-fallback">
                              <PictureOutlined
                                style={{ fontSize: "80px", color: "#d9d9d9" }}
                              />
                                                            <p>No Image Available</p>
                                                        </div>
                                                    }
                                                />
                                            ) : (
                                                <div className="image-fallback">
                          <PictureOutlined
                            style={{ fontSize: "80px", color: "#d9d9d9" }}
                          />
                                                    <p>No Image Available</p>
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    {/* Product Information Section */}
                                    <Col xs={24} md={12}>
                                        <div className="product-info">
                                            <div className="product-header">
                                                <h2 className="product-title">
                          {selectedItem.brand || "Unknown Brand"}
                                                </h2>
                                                <p className="product-subtitle">
                          {selectedItem.model || "Unknown Model"}
                                                </p>
                                            </div>

                                            <div className="product-tags">
                        <Tag
                          color={getStatusColor(selectedItem.status)}
                          size="large"
                        >
                          {selectedItem.status || "Available"}
                                                </Tag>
                        <Tag
                          color={getConditionColor(selectedItem.condition)}
                          size="large"
                        >
                          {selectedItem.condition || "-"}
                                                </Tag>
                                            </div>

                                            <div className="price-section">
                                                <div className="price-label">Price Listed</div>
                                                <div className="price-value">
                          {selectedItem.priceListed
                            ? `${selectedItem.priceListed} ${
                                selectedItem.currency || "USD"
                              }`
                            : "Price not set"}
                                                </div>
                                            </div>

                                            <div className="product-details">
                                                <Row gutter={[16, 16]}>
                                                    <Col xs={12}>
                                                        <div className="detail-item">
                                                            <div className="detail-label">Year</div>
                              <div className="detail-value">
                                {selectedItem.year || "Not specified"}
                              </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <div className="detail-item">
                              <div className="detail-label">
                                Reference Number
                              </div>
                              <div className="detail-value">
                                {selectedItem.refNo || "Not specified"}
                              </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <div className="detail-item">
                                                            <div className="detail-label">Currency</div>
                              <div className="detail-value">
                                {selectedItem.currency || "USD"}
                              </div>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <div className="detail-item">
                                                            <div className="detail-label">Condition</div>
                              <div className="detail-value">
                                {selectedItem.condition || "Not specified"}
                              </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>

                                            {selectedItem.description && (
                                                <div className="description-section">
                                                    <h4 className="description-title">Description</h4>
                          <p className="description-text">
                            {selectedItem.description}
                          </p>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>

                                <div className="detail-modal-actions">
                                    <Space>
                                        <Button onClick={handleCloseDetailModal} size="large">
                                            Close
                                        </Button>
                                        {/* Only show Edit button for owner's items */}
                    {selectedItem &&
                      selectedItem.createdBy?._id === user?._id && (
                                            <Button
                                                type="primary"
                                                onClick={() => {
                                                    handleCloseDetailModal();
                                                    handleEdit(selectedItem);
                                                }}
                                                size="large"
                                                icon={<EditIcon />}
                                            >
                                                Edit Item
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            onClick={() => {
                        console.log(
                          "Create Invoice clicked for:",
                          selectedItem
                        );
                                                handleCloseDetailModal();
                        navigate("/invoices/create", {
                          state: { productData: selectedItem },
                        });
                                            }}
                                            size="large"
                                            icon={<FileTextOutlined />}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                                        >
                                            Create Invoice
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Contact Info Modal */}
                    <Modal
                        title={
                            <div className="contact-modal-header">
                <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Product Owner Information
                            </div>
                        }
                        open={contactModal}
                        onCancel={handleCloseContactModal}
                        footer={null}
                        width={600}
                        destroyOnClose
                    >
                        {selectedItem && selectedItem.createdBy && (
                            <div className="contact-modal-content">
                                {/* Product Info */}
                                <Card size="small" style={{ marginBottom: 24 }}>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                                        <Avatar
                                            size={64}
                                            icon={<UserOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                                        />
                                    </div>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <h3 style={{ margin: 0, color: "#1890ff" }}>
                      {selectedItem.createdBy.name ||
                        selectedItem.createdBy.fullName ||
                        "Unknown Owner"}
                                        </h3>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                                            Product Owner
                                        </p>
                                    </div>
                                </Card>

                                {/* Contact Details */}
                                <Card
                                    size="small"
                                    style={{ marginBottom: 24 }}
                                    title={
                                        <span>
                      <MailOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                                            Contact Information
                                        </span>
                                    }
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Email">
                                            {selectedItem.createdBy.email ? (
                                                <a href={`mailto:${selectedItem.createdBy.email}`}>
                                                    {selectedItem.createdBy.email}
                                                </a>
                                            ) : (
                        <span style={{ color: "#999" }}>Not provided</span>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phone">
                                            {selectedItem.createdBy.phone ? (
                                                <a href={`tel:${selectedItem.createdBy.phone}`}>
                                                    {selectedItem.createdBy.phone}
                                                </a>
                                            ) : (
                        <span style={{ color: "#999" }}>Not provided</span>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Company">
                      {selectedItem.createdBy.company ||
                        selectedItem.createdBy.companyName || (
                          <span style={{ color: "#999" }}>Not specified</span>
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Location">
                      {selectedItem.createdBy.location ||
                        selectedItem.createdBy.address || (
                          <span style={{ color: "#999" }}>Not specified</span>
                                            )}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {/* Product Details */}
                                <Card
                                    size="small"
                                    style={{ marginBottom: 24 }}
                                    title={
                                        <span>
                      <TagOutlined
                        style={{ marginRight: 8, color: "#1890ff" }}
                      />
                                            Product Information
                                        </span>
                                    }
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Product">
                      <strong>
                        {selectedItem.brand} {selectedItem.model}
                      </strong>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Reference">
                      {selectedItem.refNo || "Not specified"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Condition">
                                            <Tag color={getConditionColor(selectedItem.condition)}>
                        {selectedItem.condition || "Not specified"}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color={getStatusColor(selectedItem.status)}>
                        {selectedItem.status || "Available"}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Price">
                                            {selectedItem.priceListed ? (
                        <span style={{ fontWeight: "600", color: "#28a745" }}>
                          {selectedItem.priceListed}{" "}
                          {selectedItem.currency || "USD"}
                                                </span>
                                            ) : (
                        <span style={{ color: "#999" }}>Not set</span>
                                            )}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                {/* Action Buttons */}
                <div
                  className="contact-modal-actions"
                  style={{ textAlign: "center" }}
                >
                                    <Space>
                                        <Button onClick={handleCloseContactModal} size="large">
                                            Close
                                        </Button>
                                        {selectedItem.createdBy.email && (
                                            <Button
                                                type="primary"
                                                icon={<MailOutlined />}
                                                size="large"
                                                onClick={() => {
                          window.open(
                            `mailto:${selectedItem.createdBy.email}?subject=Inquiry about ${selectedItem.brand} ${selectedItem.model}`,
                            "_blank"
                          );
                                                }}
                                            >
                                                Send Email
                                            </Button>
                                        )}
                                        {selectedItem.createdBy.phone && (
                                            <Button
                                                type="primary"
                                                icon={<PhoneOutlined />}
                                                size="large"
                        style={{
                          backgroundColor: "#52c41a",
                          borderColor: "#52c41a",
                        }}
                                                onClick={() => {
                          window.open(
                            `tel:${selectedItem.createdBy.phone}`,
                            "_blank"
                          );
                                                }}
                                            >
                                                Call Owner
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Shared Dealers Modal - Full Right Side */}
                    <Modal
                        title={
                            <div className="shared-dealers-modal-header">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TeamOutlined style={{ color: "#1890ff" }} />
                                    <span>Manage Shared Dealers</span>
                                </div>
                                <Button
                                    type="text"
                                    icon={<ReloadOutlined />}
                                    size="small"
                                    onClick={() => {
                                        fetchAvailableAdmins();
                    Toast.info("Refreshing dealer data...");
                                    }}
                                    title="Refresh dealer data"
                                />
                            </div>
                        }
                        open={sharedDealersModal}
                        onCancel={handleCloseSharedDealersModal}
                        footer={null}
                        width="100%"
                        style={{
                            top: 0,
                            right: 0,
                            margin: 0,
              height: "100vh",
              maxWidth: "100vw",
                        }}
                        className="shared-dealers-modal-full"
                        destroyOnClose
                        onOk={() => {
                            // Refresh dealer data when modal opens
                            fetchAvailableAdmins();
                        }}
                    >
                        {selectedItemForDealers && (
                            <div className="shared-dealers-modal-content-full">
                <Row gutter={[24, 24]} style={{ height: "100%" }}>
                                    {/* Left Side - Product Information */}
                                    <Col xs={24} md={8}>
                                        <div className="product-info-section">
                                            <Card
                                                title={
                                                    <span>
                            <TagOutlined
                              style={{ marginRight: 8, color: "#1890ff" }}
                            />
                                                        Product Details
                                                    </span>
                                                }
                                                className="product-info-card"
                                            >
                                                <div className="product-header-info">
                                                    <div className="product-image-container">
                            {Array.isArray(selectedItemForDealers.images) &&
                            selectedItemForDealers.images.length > 0 ? (
                                                            <Image
                                                                width={120}
                                                                height={120}
                                                                src={`${BACKEND_URL}/${selectedItemForDealers.images[0]}`}
                                                                alt={selectedItemForDealers.brand}
                                style={{
                                  borderRadius: "12px",
                                  objectFit: "cover",
                                }}
                                                                fallback={
                                                                    <div className="product-image-fallback">
                                    <PictureOutlined
                                      style={{
                                        fontSize: "60px",
                                        color: "#d9d9d9",
                                      }}
                                    />
                                                                    </div>
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="product-image-fallback">
                                <PictureOutlined
                                  style={{ fontSize: "60px", color: "#d9d9d9" }}
                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="product-text-info">
                                                        <h2 className="product-title-large">
                              {selectedItemForDealers.brand}{" "}
                              {selectedItemForDealers.model}
                                                        </h2>
                                                        <div className="product-tags-info">
                              <Tag
                                color={getStatusColor(
                                  selectedItemForDealers.status
                                )}
                                size="large"
                              >
                                {selectedItemForDealers.status || "Available"}
                                                            </Tag>
                              <Tag
                                color={getConditionColor(
                                  selectedItemForDealers.condition
                                )}
                                size="large"
                              >
                                {selectedItemForDealers.condition ||
                                  "Not specified"}
                                                            </Tag>
                                                        </div>
                                                        <div className="product-price-info">
                                                            <span className="price-label">Price:</span>
                                                            <span className="price-value">
                                {selectedItemForDealers.priceListed
                                  ? `${selectedItemForDealers.priceListed} ${
                                      selectedItemForDealers.currency || "USD"
                                    }`
                                  : "Not set"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Divider />

                                                <div className="product-details-grid">
                                                    <div className="detail-item">
                                                        <span className="detail-label">Reference:</span>
                            <span className="detail-value">
                              {selectedItemForDealers.refNo || "Not specified"}
                            </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Year:</span>
                            <span className="detail-value">
                              {selectedItemForDealers.year || "Not specified"}
                            </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Currency:</span>
                            <span className="detail-value">
                              {selectedItemForDealers.currency || "USD"}
                            </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="detail-label">Visibility:</span>
                            <Tag color="blue" size="small">
                              Shared Dealers
                            </Tag>
                                                    </div>
                                                </div>

                                                {selectedItemForDealers.description && (
                                                    <>
                                                        <Divider />
                                                        <div className="description-section">
                                                            <h4>Description</h4>
                                                            <p>{selectedItemForDealers.description}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </Card>
                                        </div>
                                    </Col>

                                    {/* Right Side - Shared Dealers Management */}
                                    <Col xs={24} md={16}>
                                        <div className="dealers-management-section">
                                            <Card
                                                title={
                                                    <span>
                            <TeamOutlined
                              style={{ marginRight: 8, color: "#1890ff" }}
                            />
                            Shared Dealers (
                            {selectedItemForDealers.selectedAdmins?.length || 0}
                            )
                                                    </span>
                                                }
                                                extra={
                                                    <Button
                                                        type="primary"
                                                        icon={<TeamOutlined />}
                                                        onClick={() => {
                                                            // TODO: Add functionality to add new dealers
                              Toast.info(
                                "Add dealer functionality coming soon"
                              );
                                                        }}
                                                    >
                                                        Add Dealer
                                                    </Button>
                                                }
                                                className="dealers-management-card"
                                            >
                                                {/* Summary of dealer information status */}
                        {selectedItemForDealers.selectedAdmins &&
                          selectedItemForDealers.selectedAdmins.length > 0 && (
                            <div
                              className="dealers-summary"
                              style={{
                                marginBottom: 16,
                                padding: 12,
                                backgroundColor: "#f5f5f5",
                                borderRadius: 6,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                                            <strong>Dealer Information Status:</strong>
                                                            <Button
                                                                size="small"
                                                                icon={<ReloadOutlined />}
                                                                onClick={() => {
                                                                    fetchAvailableAdmins();
                                    Toast.info("Refreshing all dealer data...");
                                                                }}
                                                            >
                                                                Refresh All
                                                            </Button>
                                                        </div>
                              <div style={{ fontSize: "14px", color: "#666" }}>
                                                            {(() => {
                                  const foundDealers =
                                    selectedItemForDealers.selectedAdmins.filter(
                                      (dealerId) =>
                                        availableAdmins.find((d) => {
                                          const dealerIdStr =
                                            dealerId.toString();
                                          const dId = (
                                            d._id ||
                                            d.id ||
                                            ""
                                          ).toString();
                                                                        return dId === dealerIdStr;
                                                                    })
                                                                ).length;

                                  const unknownDealers =
                                    selectedItemForDealers.selectedAdmins
                                      .length - foundDealers;

                                                                return (
                                                                    <>
                                      <span style={{ color: "#52c41a" }}>
                                        ✓ {foundDealers} dealers with complete
                                        information
                                      </span>
                                                                        {unknownDealers > 0 && (
                                        <span
                                          style={{
                                            color: "#faad14",
                                            marginLeft: 16,
                                          }}
                                        >
                                          ⚠ {unknownDealers} dealers with
                                          limited information
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                        {selectedItemForDealers.selectedAdmins &&
                        selectedItemForDealers.selectedAdmins.length > 0 ? (
                                                    <div className="shared-dealers-list-full">
                            {selectedItemForDealers.selectedAdmins.map(
                              (dealerId) => {
                                                            // Enhanced dealer lookup with better ID matching
                                console.log(
                                  `Looking for dealer ID: ${dealerId} (type: ${typeof dealerId})`
                                );
                                console.log(
                                  `Available admins:`,
                                  availableAdmins
                                );

                                const dealer = availableAdmins.find((d) => {
                                                                const dealerIdStr = dealerId.toString();
                                  const dId = (d._id || d.id || "").toString();
                                  console.log(
                                    `Comparing ${dealerIdStr} with ${dId} (user: ${
                                      d.name || d.fullName || d.username
                                    })`
                                  );
                                                                return dId === dealerIdStr;
                                                            });

                                console.log(
                                  `Found dealer for ID ${dealerId}:`,
                                  dealer
                                );

                                const isLoadingDetails =
                                  loadingDealerDetails.has(dealerId.toString());

                                                            if (dealer) {
                                                                return (
                                    <div
                                      key={dealerId}
                                      className="shared-dealer-item-full"
                                    >
                                                                        <div className="dealer-info-full">
                                                                            <Avatar
                                                                                size={56}
                                                                                icon={<UserOutlined />}
                                          style={{ backgroundColor: "#1890ff" }}
                                                                            />
                                                                            <div className="dealer-details-full">
                                                                                <div className="dealer-name-full">
                                            {dealer.name ||
                                              dealer.fullName ||
                                              dealer.username ||
                                              "Unknown Dealer"}
                                                                                </div>
                                                                                <div className="dealer-email-full">
                                            <MailOutlined
                                              style={{
                                                marginRight: 8,
                                                color: "#666",
                                              }}
                                            />
                                            {dealer.email ||
                                              "No email provided"}
                                                                                </div>
                                                                                <div className="dealer-company-full">
                                            <BusinessIcon
                                              style={{
                                                marginRight: 8,
                                                color: "#666",
                                              }}
                                            />
                                                                                    {dealer.company}
                                                                                </div>
                                                                                <div className="dealer-phone-full">
                                            <PhoneOutlined
                                              style={{
                                                marginRight: 8,
                                                color: "#666",
                                              }}
                                            />
                                                                                    {dealer.phone}
                                                                                </div>
                                                                                <div className="dealer-location-full">
                                            <SettingOutlined
                                              style={{
                                                marginRight: 8,
                                                color: "#666",
                                              }}
                                            />
                                                                                    {dealer.location}
                                                                                </div>
                                                                                <div className="dealer-role-full">
                                                                                    <Tag color="blue" size="small">
                                                                                        {dealer.role}
                                                                                    </Tag>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="dealer-actions-full">
                                                                            <Button
                                                                                type="primary"
                                                                                icon={<MailOutlined />}
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    if (dealer.email) {
                                              window.open(
                                                `mailto:${dealer.email}?subject=Inquiry about ${selectedItemForDealers.brand} ${selectedItemForDealers.model}`,
                                                "_blank"
                                              );
                                                                                    }
                                                                                }}
                                                                                disabled={!dealer.email}
                                                                            >
                                                                                Email
                                                                            </Button>
                                                                            <Button
                                                                                type="primary"
                                                                                icon={<ReloadOutlined />}
                                                                                size="small"
                                                                                loading={isLoadingDetails}
                                                                                onClick={() => {
                                            setLoadingDealerDetails((prev) =>
                                              new Set(prev).add(
                                                dealerId.toString()
                                              )
                                            );
                                            fetchUserDetails(dealerId)
                                              .then((detailedUser) => {
                                                                                        if (detailedUser) {
                                                  setAvailableAdmins((prev) => {
                                                                                                const enhancedUser = {
                                                                                                    ...detailedUser,
                                                      _id:
                                                        detailedUser._id ||
                                                        detailedUser.id,
                                                      name:
                                                        detailedUser.name ||
                                                        detailedUser.fullName ||
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] ||
                                                        "Unknown",
                                                      fullName:
                                                        detailedUser.fullName ||
                                                        detailedUser.name ||
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] ||
                                                        "Unknown",
                                                      username:
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] || "Unknown",
                                                      company:
                                                        detailedUser.company ||
                                                        detailedUser.companyId ||
                                                        "Not specified",
                                                      phone:
                                                        detailedUser.phone ||
                                                        "Not specified",
                                                      location:
                                                        detailedUser.city &&
                                                        detailedUser.country
                                                          ? `${detailedUser.city}, ${detailedUser.country}`
                                                          : detailedUser.city ||
                                                            detailedUser.country ||
                                                            "Not specified",
                                                      role:
                                                        detailedUser.role ||
                                                        "user",
                                                    };

                                                    const existingIndex =
                                                      prev.findIndex(
                                                        (u) =>
                                                          (
                                                            u._id || u.id
                                                          )?.toString() ===
                                                          (
                                                            detailedUser._id ||
                                                            detailedUser.id
                                                          )?.toString()
                                                                                                );

                                                                                                if (existingIndex >= 0) {
                                                                                                    const updated = [...prev];
                                                      updated[existingIndex] =
                                                        enhancedUser;
                                                                                                    return updated;
                                                                                                } else {
                                                      return [
                                                        ...prev,
                                                        enhancedUser,
                                                      ];
                                                                                                }
                                                                                            });

                                                                                            // Show success message
                                                  if (
                                                    detailedUser.email &&
                                                    detailedUser.email !==
                                                      `user_${dealerId.slice(
                                                        -6
                                                      )}@example.com`
                                                  ) {
                                                    Toast.success(
                                                      "Dealer information updated successfully!"
                                                    );
                                                                                            } else {
                                                    Toast.info(
                                                      "Basic dealer information created from ID"
                                                    );
                                                  }
                                                }
                                                setLoadingDealerDetails(
                                                  (prev) => {
                                                    const newSet = new Set(
                                                      prev
                                                    );
                                                    newSet.delete(
                                                      dealerId.toString()
                                                    );
                                                                                            return newSet;
                                                  }
                                                );
                                              })
                                              .catch((error) => {
                                                console.error(
                                                  "Error updating dealer info:",
                                                  error
                                                );
                                                Toast.error(
                                                  "Failed to update dealer information"
                                                );
                                                setLoadingDealerDetails(
                                                  (prev) => {
                                                    const newSet = new Set(
                                                      prev
                                                    );
                                                    newSet.delete(
                                                      dealerId.toString()
                                                    );
                                                                                            return newSet;
                                                  }
                                                );
                                                                                    });
                                                                                }}
                                                                                title="Refresh dealer information"
                                                                            >
                                                                                Refresh
                                                                            </Button>
                                                                            <Button
                                                                                type="primary"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                size="small"
                                          onClick={() =>
                                            handleRemoveSharedDealer(dealerId)
                                          }
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                // Enhanced unknown dealer display with more debugging info
                                                                return (
                                    <div
                                      key={dealerId}
                                      className="shared-dealer-item-full unknown"
                                    >
                                                                        <div className="dealer-info-full">
                                                                            <Avatar
                                                                                size={56}
                                                                                icon={<UserOutlined />}
                                          style={{ backgroundColor: "#d9d9d9" }}
                                                                            />
                                                                            <div className="dealer-details-full">
                                          <div className="dealer-name-full">
                                            Unknown Dealer
                                          </div>
                                          <div className="dealer-email-full">
                                            ID: {dealerId}
                                          </div>
                                          <div className="dealer-company-full">
                                            User may have been deleted or not
                                            found
                                          </div>
                                                                                <div className="dealer-debug-info">
                                            <small style={{ color: "#999" }}>
                                              Available users:{" "}
                                              {availableAdmins.length} | Looking
                                              for ID: {dealerId}
                                                                                    </small>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="dealer-actions-full">
                                                                            <Button
                                                                                type="primary"
                                                                                icon={<ReloadOutlined />}
                                                                                size="small"
                                          loading={loadingDealerDetails.has(
                                            dealerId.toString()
                                          )}
                                                                                onClick={() => {
                                            setLoadingDealerDetails((prev) =>
                                              new Set(prev).add(
                                                dealerId.toString()
                                              )
                                            );
                                            fetchUserDetails(dealerId)
                                              .then((detailedUser) => {
                                                                                        if (detailedUser) {
                                                  setAvailableAdmins((prev) => {
                                                                                                const enhancedUser = {
                                                                                                    ...detailedUser,
                                                      _id:
                                                        detailedUser._id ||
                                                        detailedUser.id,
                                                      name:
                                                        detailedUser.name ||
                                                        detailedUser.fullName ||
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] ||
                                                        "Unknown",
                                                      fullName:
                                                        detailedUser.fullName ||
                                                        detailedUser.name ||
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] ||
                                                        "Unknown",
                                                      username:
                                                        detailedUser.email?.split(
                                                          "@"
                                                        )[0] || "Unknown",
                                                      company:
                                                        detailedUser.company ||
                                                        detailedUser.companyId ||
                                                        "Not specified",
                                                      phone:
                                                        detailedUser.phone ||
                                                        "Not specified",
                                                      location:
                                                        detailedUser.city &&
                                                        detailedUser.country
                                                          ? `${detailedUser.city}, ${detailedUser.country}`
                                                          : detailedUser.city ||
                                                            detailedUser.country ||
                                                            "Not specified",
                                                      role:
                                                        detailedUser.role ||
                                                        "user",
                                                    };

                                                    const existingIndex =
                                                      prev.findIndex(
                                                        (u) =>
                                                          (
                                                            u._id || u.id
                                                          )?.toString() ===
                                                          (
                                                            detailedUser._id ||
                                                            detailedUser.id
                                                          )?.toString()
                                                                                                );

                                                                                                if (existingIndex >= 0) {
                                                                                                    const updated = [...prev];
                                                      updated[existingIndex] =
                                                        enhancedUser;
                                                                                                    return updated;
                                                                                                } else {
                                                      return [
                                                        ...prev,
                                                        enhancedUser,
                                                      ];
                                                                                                }
                                                                                            });

                                                                                            // Show success message
                                                  if (
                                                    detailedUser.email &&
                                                    detailedUser.email !==
                                                      `user_${dealerId.slice(
                                                        -6
                                                      )}@example.com`
                                                  ) {
                                                    Toast.success(
                                                      "Dealer information updated successfully!"
                                                    );
                                                                                            } else {
                                                    Toast.info(
                                                      "Basic dealer information created from ID"
                                                    );
                                                  }
                                                }
                                                setLoadingDealerDetails(
                                                  (prev) => {
                                                    const newSet = new Set(
                                                      prev
                                                    );
                                                    newSet.delete(
                                                      dealerId.toString()
                                                    );
                                                                                            return newSet;
                                                  }
                                                );
                                              })
                                              .catch((error) => {
                                                console.error(
                                                  "Error updating dealer info:",
                                                  error
                                                );
                                                Toast.error(
                                                  "Failed to update dealer information"
                                                );
                                                setLoadingDealerDetails(
                                                  (prev) => {
                                                    const newSet = new Set(
                                                      prev
                                                    );
                                                    newSet.delete(
                                                      dealerId.toString()
                                                    );
                                                                                            return newSet;
                                                  }
                                                );
                                                                                    });
                                                                                }}
                                                                                title="Try to fetch dealer information"
                                                                            >
                                                                                Try Fetch
                                                                            </Button>
                                                                            <Button
                                                                                type="primary"
                                                                                danger
                                                                                icon={<DeleteOutlined />}
                                                                                size="small"
                                          onClick={() =>
                                            handleRemoveSharedDealer(dealerId)
                                          }
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                              }
                            )}
                                                    </div>
                                                ) : (
                                                    <div className="empty-dealers-state">
                                                        <Empty
                                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                            description={
                                                                <div>
                                  <p>
                                    No dealers are currently shared with this
                                    product
                                  </p>
                                  <p
                                    style={{ fontSize: "14px", color: "#666" }}
                                  >
                                    Click "Add Dealer" to share this product
                                    with specific company dealers
                                                                    </p>
                                                                </div>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </Card>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Footer Actions */}
                                <div className="shared-dealers-modal-footer">
                                    <div className="footer-actions">
                                        <Button
                                            onClick={handleCloseSharedDealersModal}
                                            size="large"
                                            icon={<CloseIcon />}
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<TeamOutlined />}
                                            onClick={() => {
                                                // TODO: Add functionality to add new dealers
                        Toast.info("Add dealer functionality coming soon");
                                            }}
                                        >
                                            Add New Dealer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Wishlist Modal */}
                    <Modal
            title={
              editingWishlistItem ? "Edit Wishlist Item" : "Add Wishlist Item"
            }
                        open={wishlistModal}
                        onCancel={handleCloseWishlistModal}
                        footer={null}
                        width="90%"
            style={{ maxWidth: "800px" }}
                        destroyOnClose
                    >
                        <Form
                            form={wishlistForm}
                            layout="vertical"
                            onFinish={handleWishlistSubmit}
                            initialValues={{
                                priority: "medium",
                status: "pending",
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Item Name"
                    rules={[
                      { required: true, message: "Please enter item name" },
                    ]}
                                    >
                                        <Input placeholder="e.g., Rolex Submariner" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="priority"
                                        label="Priority"
                    rules={[
                      { required: true, message: "Please select priority" },
                    ]}
                                    >
                                        <Select size="large">
                                            <Select.Option value="low">Low</Select.Option>
                                            <Select.Option value="medium">Medium</Select.Option>
                                            <Select.Option value="high">High</Select.Option>
                                            <Select.Option value="urgent">Urgent</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                  <Form.Item name="brand" label="Brand">
                                        <Input placeholder="e.g., Rolex" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                  <Form.Item name="model" label="Model">
                                        <Input placeholder="e.g., Submariner" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                  <Form.Item name="budget" label="Budget ($)">
                                        <InputNumber
                                            placeholder="0"
                                            min={0}
                                            style={{ width: "100%" }}
                                            size="large"
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                  <Form.Item name="targetDate" label="Target Date">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            placeholder="Select date"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

              <Form.Item name="description" label="Description">
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Describe what you're looking for, any specific requirements, etc."
                                    size="large"
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                  <Form.Item name="condition" label="Preferred Condition">
                                        <Select placeholder="Select condition" size="large">
                                            <Select.Option value="new">New</Select.Option>
                                            <Select.Option value="like_new">Like New</Select.Option>
                                            <Select.Option value="excellent">Excellent</Select.Option>
                                            <Select.Option value="good">Good</Select.Option>
                                            <Select.Option value="fair">Fair</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                  <Form.Item name="source" label="Preferred Source">
                                        <Select placeholder="Select source" size="large">
                                            <Select.Option value="dealer">Dealer</Select.Option>
                      <Select.Option value="private_seller">
                        Private Seller
                      </Select.Option>
                                            <Select.Option value="auction">Auction</Select.Option>
                                            <Select.Option value="online">Online Store</Select.Option>
                                            <Select.Option value="any">Any</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            {editingWishlistItem && (
                <Form.Item name="status" label="Status">
                                    <Select size="large">
                                        <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="in_progress">
                      In Progress
                    </Select.Option>
                                        <Select.Option value="completed">Completed</Select.Option>
                                        <Select.Option value="cancelled">Cancelled</Select.Option>
                                    </Select>
                                </Form.Item>
                            )}

              <div style={{ textAlign: "right", marginTop: "24px" }}>
                                <Space>
                                    <Button onClick={handleCloseWishlistModal} size="large">
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" size="large">
                                        {editingWishlistItem ? "Update" : "Add"}
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                    </Modal>

                    {/* CSV Upload Modal */}
                    <Modal
                        title={
                            <div className="csv-modal-header">
                <UploadOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Upload CSV File
                            </div>
                        }
                        open={csvUploadModal}
                        onCancel={handleCloseCsvModal}
                        footer={null}
                        width="90%"
            style={{ maxWidth: "700px" }}
                        destroyOnClose
                    >
                        <div className="csv-modal-content">
                            {/* CSV Requirements Info */}
                            <Card
                                size="small"
                                style={{ marginBottom: 24 }}
                                title={
                                    <span>
                    <InfoCircleOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                                        CSV File Requirements
                                    </span>
                                }
                            >
                                <ul className="csv-requirements-list">
                                    <li>File must be in CSV format (.csv)</li>
                                    <li>First row should contain headers</li>
                  <li>
                    Required columns: <strong>brand</strong>,{" "}
                    <strong>model</strong>
                  </li>
                  <li>
                    Optional columns: year, refNo, condition, status,
                    priceListed, currency, description
                  </li>
                                    <li>Maximum file size: 10MB</li>
                                </ul>
                                <Button
                                    type="dashed"
                                    onClick={downloadCsvTemplate}
                                    icon={<DownloadOutlined />}
                                    style={{ marginTop: 16 }}
                                >
                                    Download Template
                                </Button>
                            </Card>

                            {/* File Upload Section */}
                            <Card
                                size="small"
                                style={{ marginBottom: 24 }}
                                title={
                                    <span>
                    <FileTextOutlined
                      style={{ marginRight: 8, color: "#52c41a" }}
                    />
                                        Select CSV File
                                    </span>
                                }
                            >
                                <Upload.Dragger
                                    accept=".csv,text/csv,application/csv,text/plain"
                                    beforeUpload={() => false}
                                    onChange={({ fileList }) => {
                                        if (fileList.length > 0) {
                                            const file = fileList[0].originFileObj || fileList[0];
                                            handleCsvFileSelect({ target: { files: [file] } });
                                        }
                                    }}
                                    maxCount={1}
                                    showUploadList={false}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                  <p className="ant-upload-text">
                    Click or drag CSV file to this area to upload
                                    </p>
                  <p className="ant-upload-hint">Support for .csv files only</p>
                                </Upload.Dragger>

                                {csvFile && (
                                    <div className="csv-file-info">
                                        <Descriptions size="small" column={1}>
                      <Descriptions.Item label="File Name">
                        {csvFile.name}
                      </Descriptions.Item>
                                            <Descriptions.Item label="File Size">
                                                {(csvFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Descriptions.Item>
                      <Descriptions.Item label="File Type">
                        {csvFile.type || "text/csv"}
                      </Descriptions.Item>
                                        </Descriptions>
                                    </div>
                                )}
                            </Card>

                            {/* CSV Preview */}
                            {csvPreview && (
                                <Card
                                    size="small"
                                    style={{ marginBottom: 24 }}
                                    title={
                                        <span>
                      <EyeOutlined
                        style={{ marginRight: 8, color: "#722ed1" }}
                      />
                                            CSV Preview
                                        </span>
                                    }
                                >
                                    <div className="csv-preview-table">
                                        <Table
                                            dataSource={csvPreview.previewRows}
                      columns={csvPreview.headers.map((header) => ({
                                                title: header,
                                                dataIndex: header,
                                                key: header,
                        render: (text) => text || "-",
                        ellipsis: true,
                                            }))}
                                            size="small"
                                            pagination={false}
                      scroll={{ x: "max-content" }}
                                        />
                                    </div>
                                </Card>
                            )}

                            {/* Error Display */}
                            {csvUploadError && (
                                <Alert
                                    message="Upload Error"
                                    description={csvUploadError}
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                            )}

                            {/* Action Buttons */}
                            <div className="csv-modal-actions">
                                <Space>
                                    <Button onClick={handleCloseCsvModal} size="large">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={handleCsvUpload}
                                        disabled={!csvFile || csvUploading}
                                        loading={csvUploading}
                                        size="large"
                                        icon={<UploadOutlined />}
                                    >
                    {csvUploading ? "Uploading..." : "Upload CSV"}
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </Modal>

                    {/* Share Link Modal */}
                    <Modal
                        title={
                            <div className="share-modal-header">
                <ShareAltOutlined
                  style={{ marginRight: 8, color: "#52c41a" }}
                />
                                Share Watch
                            </div>
                        }
                        open={shareModal}
                        onCancel={closeShareModal}
                        footer={null}
                        width={600}
                        destroyOnClose
                    >
                        <div className="share-modal-content">
                            <div className="share-success-section">
                                <div className="share-icon">
                                    <CheckCircleOutlined />
                                </div>
                                <h3 className="share-title">Share Link Generated!</h3>
                                <p className="share-description">
                                    Share this link with potential buyers to showcase your watch.
                                </p>
                            </div>

                            <Card
                                size="small"
                                style={{ marginBottom: 24 }}
                                title={
                                    <span>
                    <LinkOutlined
                      style={{ marginRight: 8, color: "#1890ff" }}
                    />
                                        Share Link
                                    </span>
                                }
                            >
                                <div className="share-link-container">
                                    <Input
                                        value={shareLink}
                                        readOnly
                                        size="large"
                                        suffix={
                                            <Button
                                                type="primary"
                                                onClick={copyShareLink}
                                                size="small"
                                                icon={<CopyOutlined />}
                                            >
                                                Copy
                                            </Button>
                                        }
                                    />
                                </div>
                            </Card>

                            <Alert
                                message="Important Note"
                                description="This link will be accessible to anyone who has it. The watch will be visible on your public profile."
                                type="success"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />

                            <div className="share-modal-actions">
                                <Space>
                                    <Button onClick={closeShareModal} size="large">
                                        Close
                                    </Button>
                                    <Button
                                        type="primary"
                                        href={shareLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="large"
                                        icon={<LinkOutlined />}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                    }}
                                    >
                                        Open Link
                                    </Button>
                                </Space>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default Inventory;
