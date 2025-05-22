"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import {
  Grid,
  Box,
  Button,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  CircularProgress,
  Container,
} from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"

function EditDraft() {
  const { ActivityId } = useParams()
  console.log("Activity ID:", ActivityId)
  const [pages, setPages] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [types, setTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [visibleDependents, setVisibleDependents] = useState({})
  const [changedFiles, setChangedFiles] = useState({}) // Track which files have been changed
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState("")
  const navigate = useNavigate()

  const handleChange = (id, value) => {
    console.log(`Handling change for field ${id} with value:`, value)

    // If the ID already includes an underscore, it's already in the combined format
    if (id.toString().includes("_")) {
      // This is already a combined ID (parentId_dependentId)
      setFormData((prev) => ({ ...prev, [id]: value }))
      setErrors((prev) => ({ ...prev, [id]: false }))

      // If this is a file input, mark it as changed
      if (value && typeof value === "object" && value instanceof File) {
        setChangedFiles((prev) => ({ ...prev, [id]: true }))
      }

      return // Skip the rest since we've handled it with the combined ID
    }

    // Check if this is a dependent field that needs a combined ID
    const numericId = Number.parseInt(id)
    if (isVisibleDependent(numericId)) {
      const parentId = getParentId(numericId)
      if (parentId) {
        // Use combined ID format for dependent fields: parentId_dependentId
        const combinedId = `${parentId}_${id}`
        console.log(`Converting dependent field ${id} to combined ID ${combinedId}`)
        setFormData((prev) => ({ ...prev, [combinedId]: value }))
        setErrors((prev) => ({ ...prev, [combinedId]: false }))

        // If this is a file input, mark it as changed
        if (value && typeof value === "object" && value instanceof File) {
          setChangedFiles((prev) => ({ ...prev, [combinedId]: true }))
        }

        return // Skip the rest since we've handled it with the combined ID
      }
    }

    // For non-dependent fields or already combined IDs
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: false }))

    // If this is a file input, mark it as changed
    if (value && typeof value === "object" && value instanceof File) {
      setChangedFiles((prev) => ({ ...prev, [id]: true }))
    }

    // Handle dependencies when value changes
    if (!id.toString().includes("_")) {
      // Only update dependencies for parent fields
      updateDependentFields(id, value)
    }
  }

  // Function to update dependent fields based on parent field value
  const updateDependentFields = (parentId, value) => {
    // Convert parentId to number if it's a string
    const numericParentId = typeof parentId === "string" ? Number.parseInt(parentId) : parentId

    const parentCheckpoint = checkpoints.find((cp) => cp.CheckpointId === numericParentId)

    if (!parentCheckpoint || !parentCheckpoint.Dependent || parentCheckpoint.Dependent.trim() === "") {
      return
    }

    console.log(`Updating dependents for ${numericParentId} with value:`, value)

    // Special case for Dependent = 6
    if (parentCheckpoint.Dependent.trim() === "6") {
      // Set the dependent ID 6 to be visible for this parent
      const newVisibleDependents = { ...visibleDependents }
      newVisibleDependents[numericParentId] = [6]
      setVisibleDependents(newVisibleDependents)
      return
    }

    // Check if the parent field is of type Radio, Checkbox, or Dropdown (TypeId 5, 6, or 9)
    if ([5, 6, 9].includes(parentCheckpoint.TypeId)) {
      const options = parentCheckpoint.Options ? parentCheckpoint.Options.split(",").map((opt) => opt.trim()) : []
      const dependentMapping = parentCheckpoint.Dependent.split(":").map((dep) => dep.trim())

      // Create a map of visible dependent fields
      const newVisibleDependents = { ...visibleDependents }

      // For Radio and Dropdown (single select)
      if (parentCheckpoint.TypeId === 5 || (parentCheckpoint.TypeId === 9 && parentCheckpoint.Correct !== "1")) {
        // Find the selected option index
        const selectedIndex = options.findIndex((opt) => opt.trim() === value)

        if (selectedIndex !== -1 && selectedIndex < dependentMapping.length) {
          // Get dependent IDs for the selected option
          const dependentIds = dependentMapping[selectedIndex]
            .split(",")
            .filter((id) => id !== "0")
            .map((id) => Number.parseInt(id))

          // Set visible dependents for this parent
          newVisibleDependents[numericParentId] = dependentIds
        } else {
          // Clear dependents if no match
          newVisibleDependents[numericParentId] = []
        }
      }
      // For Checkbox and multi-select Dropdown
      else if (parentCheckpoint.TypeId === 6 || (parentCheckpoint.TypeId === 9 && parentCheckpoint.Correct === "1")) {
        // For multi-select, value could be an array or comma-separated string
        const selectedValues = Array.isArray(value) ? value : value ? value.split(",").map((v) => v.trim()) : []

        // Get all dependent IDs for all selected options
        const dependentIds = []
        selectedValues.forEach((val) => {
          const optionIndex = options.findIndex((opt) => opt.trim() === val)
          if (optionIndex !== -1 && optionIndex < dependentMapping.length) {
            const ids = dependentMapping[optionIndex]
              .split(",")
              .filter((id) => id !== "0")
              .map((id) => Number.parseInt(id))
            dependentIds.push(...ids)
          }
        })

        // Set visible dependents for this parent
        newVisibleDependents[numericParentId] = dependentIds
      }

      console.log("New visible dependents:", newVisibleDependents)
      setVisibleDependents(newVisibleDependents)
    }
  }

  // Function to check if a checkpoint should be visible as a dependent
  const isVisibleDependent = (checkpointId) => {
    // Check if this checkpoint is a dependent of any parent in visibleDependents
    for (const parentId in visibleDependents) {
      if (visibleDependents[parentId] && visibleDependents[parentId].includes(checkpointId)) {
        return true
      }
    }
    return false
  }

  // Function to get the parent ID of a dependent checkpoint
  const getParentId = (checkpointId) => {
    for (const parentId in visibleDependents) {
      if (visibleDependents[parentId].includes(checkpointId)) {
        return Number.parseInt(parentId)
      }
    }
    return null
  }

  const getType = (typeId) => {
    const type = types.find((t) => t.TypeId === typeId)
    return type ? type.Type.trim() : "Unknown"
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const menuRes = await axios.get("https://namami-infotech.com/SANCHAR/src/menu/get_menu.php")
        const checkpointRes = await axios.get("https://namami-infotech.com/SANCHAR/src/menu/get_checkpoints.php")
        const typeRes = await axios.get("https://namami-infotech.com/SANCHAR/src/menu/get_types.php")

        const checkpointIds = menuRes.data.data[0].CheckpointId.split(";").map((p) =>
          p.split(",").map((id) => Number.parseInt(id)),
        )

        setPages(checkpointIds)
        setCheckpoints(checkpointRes.data.data)
        setTypes(typeRes.data.data)

        if (ActivityId) {
          const transRes = await axios.get(
            `https://namami-infotech.com/SANCHAR/src/menu/get_transaction_dtl.php?activityId=${ActivityId}`,
          )

          const existingData = {}
          const dependentData = {}

          for (const item of transRes.data.data) {
            const chkId = item.ChkId.toString()
            const value = item.Value

            // Check if this is a dependent field (format: parentId_dependentId)
            if (chkId.includes("_")) {
              const [parentId, dependentId] = chkId.split("_").map((id) => Number.parseInt(id))

              // Store the dependent field value using the ORIGINAL combined ID as the key
              existingData[chkId] = value

              console.log(`Loading dependent field ${chkId} with value:`, value)

              // Make sure the dependent is visible by updating the visibleDependents state
              dependentData[parentId] = dependentData[parentId] || []
              if (!dependentData[parentId].includes(dependentId)) {
                dependentData[parentId].push(dependentId)
              }

              continue
            }

            const cp = checkpointRes.data.data.find((c) => c.CheckpointId === Number.parseInt(chkId))
            const type = typeRes.data.data.find((t) => t.TypeId === cp?.TypeId)?.Type.toLowerCase()

            if (!cp || !type) continue

            let finalValue = value

            if (type === "checkbox") {
              finalValue = value ? value.split(",") : []
            }

            existingData[chkId] = finalValue

            console.log(`Loaded value for CheckpointId ${chkId} (${cp.Description}) [type: ${type}]:`, finalValue)
          }

          setFormData(existingData)

          // Set up visible dependents based on existing data
          if (Object.keys(dependentData).length > 0) {
            setVisibleDependents(dependentData)
          }

          // Also check for checkpoints with Dependent=6 that have values
          const checkpointsWithDependentSix = checkpointRes.data.data.filter(
            (cp) => cp.Dependent && cp.Dependent.trim() === "6" && existingData[cp.CheckpointId],
          )

          if (checkpointsWithDependentSix.length > 0) {
            const newDependents = { ...dependentData }
            checkpointsWithDependentSix.forEach((cp) => {
              newDependents[cp.CheckpointId] = [6]
            })
            setVisibleDependents(newDependents)
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
        setLoadingError("Failed to load form data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ActivityId])

  // Initialize dependencies when form data or checkpoints change
  useEffect(() => {
    if (checkpoints.length > 0) {
      console.log("Initializing dependencies from form data:", formData)
      // Process all form fields to update dependencies
      Object.entries(formData).forEach(([id, value]) => {
        // Skip dependent fields (those with parent IDs)
        if (!id.includes("_")) {
          updateDependentFields(Number.parseInt(id), value)
        }
      })
    }
  }, [checkpoints, formData]) // Run when checkpoints or formData changes

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (isDraft = false) => {
    // Only validate required fields on final submission, not for drafts
    if (!isDraft) {
      // Validate all fields across all pages
      const newErrors = {}
      let hasErrors = false

      // Check all pages for required fields
      pages.forEach((pageCheckpoints) => {
        pageCheckpoints.forEach((id) => {
          const cp = checkpoints.find((c) => c.CheckpointId === id)
          const value = formData[id]
          if (!cp) return

          const type = getType(cp.TypeId).toLowerCase()
          if (type.includes("header") || type.includes("description")) return

          if (
            cp.Mandatory === 1 &&
            (value === undefined ||
              value === null ||
              (typeof value === "string" && value.trim() === "") ||
              (Array.isArray(value) && value.length === 0))
          ) {
            newErrors[id] = true
            hasErrors = true
          }
        })
      })

      if (hasErrors) {
        setErrors(newErrors)
        Swal.fire({
          icon: "error",
          title: "Missing Required Fields",
          text: "Please fill all mandatory fields before submitting.",
          confirmButtonColor: "#F69320",
        })
        return
      }
    }

    // Clear any previous errors
    setErrors({})

    // Show loading indicator
    Swal.fire({
      title: isDraft ? "Saving draft..." : "Submitting form...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    const menuId = 1
    const date = new Date()
    const dateTime = date.toISOString().slice(0, 19).replace("T", " ")

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latLong = `${pos.coords.latitude}, ${pos.coords.longitude}`

        const submitData = async () => {
          const textData = {}
          const imageData = {}

          // First, collect all form data keys to process
          const formDataKeys = Object.keys(formData)

          console.log("All form data keys before submission:", formDataKeys)

          // Process all form data entries
          for (const key of formDataKeys) {
            const value = formData[key]

            // Check if this is a dependent field (format: parentId_dependentId)
            if (key.includes("_")) {
              console.log(`Processing dependent field ${key} with value:`, value)

              // For dependent fields with image type
              if (value && typeof value === "object" && value instanceof File) {
                const base64 = await convertToBase64(value)
                imageData[key] = base64
                console.log(`Added dependent image field ${key} to imageData`)
              } else {
                // For text-based dependent fields
                textData[key] = Array.isArray(value) ? value.join(",") : value
                console.log(`Added dependent text field ${key} to textData with value:`, textData[key])
              }

              continue
            }

            // For regular fields, find the checkpoint to determine type
            const cpId = Number.parseInt(key)
            const cp = checkpoints.find((c) => c.CheckpointId === cpId)

            if (!cp) {
              console.log(`No checkpoint found for ID ${key}, skipping`)
              continue
            }

            const type = getType(cp.TypeId).toLowerCase()

            if (type === "pic/camera") {
              // Only include image data if it's a new file (File object)
              if (value && typeof value === "object" && value instanceof File) {
                const base64 = await convertToBase64(value)
                imageData[key] = base64
                console.log(`Added regular image field ${key} to imageData`)
              }
              // Do NOT include existing image data that hasn't changed
            } else {
              // For text-based fields
              if (
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "") ||
                (Array.isArray(value) && value.length === 0)
              ) {
                textData[key] = null
              } else {
                textData[key] = Array.isArray(value) ? value.join(",") : value
              }
              console.log(`Added regular text field ${key} to textData with value:`, textData[key])
            }
          }

          try {
            console.log("Sending text data to API:", textData)

            // Use update_transaction.php instead of add_transaction.php
            await axios.post("https://namami-infotech.com/SANCHAR/src/menu/update_transaction.php", {
              menuId,
              ActivityId,
              LatLong: latLong,
              Draft: isDraft ? 1 : 0,
              data: textData,
            })

            // Only send image data if there are actually new/changed images
            if (Object.keys(imageData).length > 0) {
              console.log("Sending updated image data:", Object.keys(imageData))
              await axios.post("https://namami-infotech.com/SANCHAR/src/menu/add_image.php", {
                menuId,
                ActivityId,
                LatLong: latLong,
                data: imageData,
              })
            } else {
              console.log("No image data changes to send")
            }

            Swal.fire({
              icon: "success",
              title: isDraft ? "Draft Updated" : "Form Updated",
              text: isDraft ? "Your draft has been updated successfully!" : "Your form has been updated successfully!",
              confirmButtonColor: "#F69320",
            }).then(() => {
              navigate("/tender")
            })
          } catch (error) {
            console.error("Update error:", error)
            Swal.fire({
              icon: "error",
              title: "Update Failed",
              text: "There was an error processing your request. Please try again.",
              confirmButtonColor: "#F69320",
            })
          }
        }

        submitData() // call the async inner function
      },
      (error) => {
        Swal.fire({
          icon: "error",
          title: "Location Access Denied",
          text: "Please allow location access to submit the form.",
          confirmButtonColor: "#F69320",
        })
      },
      { timeout: 10000, enableHighAccuracy: true },
    )
  }

  const renderField = (cp) => {
    const type = getType(cp.TypeId).toLowerCase()
    const id = cp.CheckpointId.toString()
    // Check if this is a dependent field
    const parentId = getParentId(cp.CheckpointId)
    const actualId = parentId ? `${parentId}_${cp.CheckpointId}` : id
    const value = formData[actualId] ?? (type === "checkbox" ? [] : "")
    console.log(`Rendering field ${id} (${cp.Description}) with actualId: ${actualId}, value:`, value)
    const options = cp.Options ? cp.Options.split(",").map((opt) => opt.trim()) : []
    const error = errors[id]
    const editable = cp.Editable === 1
    const isMandatory = cp.Mandatory === 1

    if (type.includes("header")) {
      return (
        <Typography variant="h6" sx={{ mt: 3, mb: 1, textAlign: "center", color: "#F69320", fontWeight: "bold" }}>
          {cp.Description}
        </Typography>
      )
    }

    if (type.includes("description")) {
      return (
        <Typography sx={{ mb: 2, fontStyle: "italic", color: "#666", textAlign: "center" }}>
          {cp.Description}
        </Typography>
      )
    }

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Typography sx={{ fontWeight: 500, color: "#555" }}>
            {cp.Description}
            {isMandatory && <span style={{ color: "red", marginLeft: "4px" }}>*</span>}
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          {(() => {
            switch (type) {
              case "text":
                return (
                  <TextField
                    fullWidth
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "email":
                return (
                  <TextField
                    fullWidth
                    type="email"
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "digit":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "number":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "long text":
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "date":
                return (
                  <TextField
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) => handleChange(actualId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F69320",
                      },
                    }}
                  />
                )
              case "dropdown":
                const isMulti = cp.Correct === "1"

                return (
                  <Autocomplete
                    fullWidth
                    multiple={isMulti}
                    options={options}
                    value={isMulti ? (value ? (Array.isArray(value) ? value : value.split(",")) : []) : value || null}
                    onChange={(event, newValue) => {
                      const finalValue = isMulti ? newValue.join(",") : newValue
                      handleChange(actualId, finalValue)
                    }}
                    disabled={!editable}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={error}
                        helperText={error ? "This field is required" : ""}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#F69320",
                          },
                        }}
                      />
                    )}
                  />
                )

              case "radio":
                return (
                  <>
                    <RadioGroup row value={value} onChange={(e) => handleChange(actualId, e.target.value)}>
                      {options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={
                            <Radio
                              disabled={!editable}
                              sx={{
                                "&.Mui-checked": {
                                  color: "#F69320",
                                },
                              }}
                            />
                          }
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                    {error && (
                      <Typography color="error" variant="body2">
                        This field is required
                      </Typography>
                    )}
                  </>
                )
              case "checkbox":
                return (
                  <FormGroup row>
                    {options.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={Array.isArray(value) ? value.includes(opt) : value?.includes(opt)}
                            onChange={(e) => {
                              const checked = e.target.checked
                              let newValue = []

                              if (Array.isArray(value)) {
                                newValue = [...value]
                              } else if (typeof value === "string" && value) {
                                newValue = value.split(",")
                              }

                              if (checked && !newValue.includes(opt)) {
                                newValue.push(opt)
                              } else if (!checked) {
                                newValue = newValue.filter((v) => v !== opt)
                              }

                              handleChange(actualId, newValue)
                            }}
                            disabled={!editable}
                            sx={{
                              "&.Mui-checked": {
                                color: "#F69320",
                              },
                            }}
                          />
                        }
                        label={opt}
                      />
                    ))}
                  </FormGroup>
                )
              case "pic/camera":
                return (
                  <Box>
                    {typeof value === "string" &&
                      (value.startsWith("data:application/pdf") ? (
                        <Box sx={{ mb: 1 }}>
                          <embed src={value} type="application/pdf" width="100%" height="400px" />
                        </Box>
                      ) : value.startsWith("data:") || value.startsWith("http") ? (
                        <Box sx={{ mb: 1 }}>
                          <img
                            src={value || "/placeholder.svg"}
                            alt="Uploaded"
                            style={{ width: 200, borderRadius: 4 }}
                          />
                        </Box>
                      ) : null)}

                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderColor: error ? "#d32f2f" : "#ddd",
                        color: error ? "#d32f2f" : "#666",
                        "&:hover": {
                          borderColor: "#F69320",
                          backgroundColor: "rgba(246, 147, 32, 0.04)",
                        },
                      }}
                      disabled={!editable}
                    >
                      {value ? "Change File" : "Upload File"}
                      <input
                        type="file"
                        hidden
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleChange(actualId, e.target.files[0])
                          }
                        }}
                      />
                    </Button>
                    {value && typeof value === "object" && value instanceof File && (
                      <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                        Selected: {value.name}
                      </Typography>
                    )}
                    {error && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        This field is required
                      </Typography>
                    )}
                  </Box>
                )

              default:
                return <TextField size="small" disabled />
            }
          })()}
        </Grid>
      </Grid>
    )
  }

  // Function to render a checkpoint with its dependent fields
  const renderCheckpointWithDependents = (cp, pageData) => {
    const isEven = pageData.indexOf(cp.CheckpointId) % 2 === 0
    const bgColor = isEven ? "#f8f8f8" : "#ffffff"

    // Get dependent checkpoints for this parent
    const dependentIds = visibleDependents[cp.CheckpointId] || []
    const dependentCheckpoints = checkpoints.filter((c) => dependentIds.includes(c.CheckpointId))

    if (dependentIds.length > 0) {
      console.log(`Parent ${cp.CheckpointId} (${cp.Description}) has dependents:`, dependentIds)
      dependentCheckpoints.forEach((depCp) => {
        console.log(
          `  - Dependent ${depCp.CheckpointId} (${depCp.Description}) has value:`,
          formData[depCp.CheckpointId],
        )
      })
    }

    return (
      <Paper
        key={cp.CheckpointId}
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 1,
          maxWidth: "85%",
          mx: "auto",
          mb: 2,
          backgroundColor: bgColor,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>{renderField(cp)}</Box>
        </Box>

        {/* Render dependent fields if any */}
        {dependentCheckpoints.length > 0 && (
          <Box
            sx={{
              pl: 4,
              mt: 2,
              borderLeft: "2px solid #F69320",
            }}
          >
            {dependentCheckpoints.map((depCp) => (
              <Box key={depCp.CheckpointId} sx={{ mb: 1 }}>
                {renderField(depCp)}
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    )
  }

  const pageData = pages[currentPage] || []

  const handleNext = () => setCurrentPage((prev) => prev + 1)
  const handlePrevious = () => setCurrentPage((prev) => prev - 1)

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh" flexDirection="column">
        <CircularProgress sx={{ color: "#F69320" }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading form...
        </Typography>
      </Box>
    )
  }

  if (loadingError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Box sx={{ maxWidth: 500, textAlign: "center", p: 3, bgcolor: "#ffebee", borderRadius: 1 }}>
          <Typography color="error" variant="h6">
            {loadingError}
          </Typography>
          <Button
            sx={{ mt: 2, color: "#F69320", borderColor: "#F69320" }}
            onClick={() => window.location.reload()}
            variant="outlined"
          >
            Retry
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Box
        sx={{
          background: "linear-gradient(to right, #F69320, #FFC107)",
          color: "white",
          p: 2,
          borderRadius: 1,
          textAlign: "center",
          mb: 3,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {currentPage >= 3 ? "Letter Of Allotment" : "Edit Tender Application"}
        </Typography>
        <Typography variant="body2">
          {currentPage >= 3
            ? "Please complete the Letter Of Allotment details"
            : "Please review and update all sections"}
        </Typography>
      </Box>

      <Stepper
        activeStep={currentPage}
        alternativeLabel
        sx={{
          mb: 3,
          "& .MuiStepIcon-root.Mui-active": {
            color: "#F69320",
          },
          "& .MuiStepIcon-root.Mui-completed": {
            color: "#4caf50",
          },
        }}
      >
        {pages.map((_, index) => (
          <Step key={index}>
            <StepLabel>Step {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Progress indicator */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Step {currentPage + 1} of {pages.length}
        </Typography>
      </Box>

      {/* Render checkpoints for current page */}
      <Box sx={{ mb: 3 }}>
        {pageData.map((id) => {
          const cp = checkpoints.find((c) => c.CheckpointId === id)
          if (!cp) return null

          // Skip dependent fields - they will be rendered with their parent
          if (isVisibleDependent(cp.CheckpointId)) {
            return null
          }

          return renderCheckpointWithDependents(cp, pageData)
        })}
      </Box>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
        {currentPage > 0 && (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              minWidth: "120px",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
            onClick={handlePrevious}
          >
            Previous
          </Button>
        )}

        {currentPage === pages.length - 1 ? (
          <>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#757575",
                color: "white",
                minWidth: "120px",
                "&:hover": {
                  backgroundColor: "#616161",
                },
              }}
              onClick={() => handleSubmit(true)} // Save Draft
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#F69320",
                color: "white",
                minWidth: "120px",
                "&:hover": {
                  backgroundColor: "#e08416",
                },
              }}
              onClick={() => handleSubmit(false)} // Submit
            >
              Submit
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#F69320",
              color: "white",
              minWidth: "120px",
              "&:hover": {
                backgroundColor: "#e08416",
              },
            }}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Help text */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Fields marked with <span style={{ color: "red" }}>*</span> are mandatory
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your progress is saved as you navigate between steps
        </Typography>
      </Box>
    </Container>
  )
}

export default EditDraft
