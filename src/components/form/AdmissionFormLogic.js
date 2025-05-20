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
} from "@mui/material"
import { useNavigate } from "react-router-dom"

function AdmissionFormLogic() {
  const [pages, setPages] = useState([])
  const [checkpoints, setCheckpoints] = useState([])
  const [types, setTypes] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [visibleDependents, setVisibleDependents] = useState({})
  const navigate = useNavigate()

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: false }))

    // Handle dependencies when value changes
    updateDependentFields(id, value)
  }

  // Function to update dependent fields based on parent field value
  const updateDependentFields = (parentId, value) => {
    const parentCheckpoint = checkpoints.find((cp) => cp.CheckpointId === parentId)

    if (!parentCheckpoint || !parentCheckpoint.Dependent || parentCheckpoint.Dependent.trim() === "") {
      return
    }

    // Special case for Dependent = 6
    if (parentCheckpoint.Dependent.trim() === "6") {
      // Set the dependent ID 6 to be visible for this parent
      const newVisibleDependents = { ...visibleDependents }
      newVisibleDependents[parentId] = [6]
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
          newVisibleDependents[parentId] = dependentIds
        } else {
          // Clear dependents if no match
          newVisibleDependents[parentId] = []
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
        newVisibleDependents[parentId] = dependentIds
      }

      setVisibleDependents(newVisibleDependents)
    }
  }

  // Function to check if a checkpoint should be visible as a dependent
  const isVisibleDependent = (checkpointId) => {
    // Check if this checkpoint is a dependent of any parent in visibleDependents
    for (const parentId in visibleDependents) {
      if (visibleDependents[parentId].includes(checkpointId)) {
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

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  // Initialize dependencies when form data or checkpoints change
  useEffect(() => {
    // Process all form fields to update dependencies
    Object.entries(formData).forEach(([id, value]) => {
      updateDependentFields(Number.parseInt(id), value)
    })
  }, [checkpoints]) // Only run when checkpoints are loaded

  const getType = (typeId) => {
    const type = types.find((t) => t.TypeId === typeId)
    return type ? type.Type.trim() : "Unknown"
  }

  const renderField = (cp) => {
    const type = getType(cp.TypeId).trim()
    const options = cp.Options ? cp.Options.split(",").map((opt) => opt.trim()) : []
    const value = formData[cp.CheckpointId] || ""
    const error = errors[cp.CheckpointId]
    const editable = cp.Editable === 1

    // Special layout for Header / Description
    if (type.toLowerCase().includes("header")) {
      return (
        <Typography variant="h6" sx={{ mt: 3, mb: 1, textAlign: "center" }}>
          {cp.Description}
        </Typography>
      )
    }

    if (type.toLowerCase().includes("description")) {
      return <Typography sx={{ mb: 2 }}>{cp.Description}</Typography>
    }

    // Common layout: Label left, Field right
    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Typography>{cp.Description}</Typography>
        </Grid>
        <Grid item xs={8}>
          {(() => {
            switch (type) {
              case "Text":
                return (
                  <TextField
                    fullWidth
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )

              case "Email":
                return (
                  <TextField
                    fullWidth
                    type="email"
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )
              case "Number":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )
              case "Digit":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )

              case "Long Text":
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )

              case "Date":
                return (
                  <TextField
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}
                    error={error}
                    helperText={error ? "This field is required" : ""}
                    disabled={!editable}
                  />
                )

              case "Dropdown":
                const isMultiSelect = cp.Correct === "1"

                return (
                  <Autocomplete
                    fullWidth
                    multiple={isMultiSelect}
                    options={options}
                    value={
                      isMultiSelect ? (value ? (Array.isArray(value) ? value : value.split(",")) : []) : value || null
                    }
                    onChange={(event, newValue) => {
                      const finalValue = isMultiSelect ? newValue.join(",") : newValue
                      handleChange(cp.CheckpointId, finalValue)
                    }}
                    disabled={!editable}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label=""
                        error={error}
                        helperText={error ? "This field is required" : ""}
                      />
                    )}
                  />
                )

              case "Radio":
                return (
                  <>
                    <RadioGroup row value={value} onChange={(e) => handleChange(cp.CheckpointId, e.target.value)}>
                      {options.map((opt) => (
                        <FormControlLabel key={opt} value={opt} control={<Radio disabled={!editable} />} label={opt} />
                      ))}
                    </RadioGroup>
                    {error && (
                      <Typography color="error" variant="body2">
                        This field is required
                      </Typography>
                    )}
                  </>
                )

              case "Checkbox":
                return (
                  <FormGroup row>
                    {options.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={value?.includes(opt)}
                            onChange={(e) => {
                              const checked = e.target.checked
                              let updated = []

                              if (typeof value === "string") {
                                updated = value ? value.split(",").map((v) => v.trim()) : []
                              } else if (Array.isArray(value)) {
                                updated = [...value]
                              }

                              if (checked && !updated.includes(opt)) {
                                updated.push(opt)
                              } else if (!checked) {
                                updated = updated.filter((v) => v !== opt)
                              }

                              handleChange(cp.CheckpointId, updated)
                            }}
                            disabled={!editable}
                          />
                        }
                        label={opt}
                      />
                    ))}
                  </FormGroup>
                )

              case "Pic/Camera":
                return (
                  <TextField
                    fullWidth
                    type="file"
                    inputProps={{ accept: "image/png, image/jpeg, application/pdf" }}
                    onChange={(e) => handleChange(cp.CheckpointId, e.target.files[0])}
                    disabled={!editable}
                  />
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
    const bgColor = isEven ? "#f0f0f0" : "#dcdcdc" // light grey and grey

    // Get dependent checkpoints for this parent
    const dependentIds = visibleDependents[cp.CheckpointId] || []
    const dependentCheckpoints = checkpoints.filter((c) => dependentIds.includes(c.CheckpointId))

    return (
      <Box key={cp.CheckpointId} sx={{ mb: 1 }}>
        <Paper
          elevation={1}
          sx={{
            p: 1,
            borderRadius: 1,
            maxWidth: "70%",
            mx: "auto",
            backgroundColor: bgColor,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>{renderField(cp)}</Box>
          </Box>

          {/* Render dependent fields if any */}
          {dependentCheckpoints.length > 0 && (
            <Box sx={{ pl: 4, mt: 2, borderLeft: "2px solid #ccc" }}>
              {dependentCheckpoints.map((depCp) => (
                <Box key={depCp.CheckpointId} sx={{ mb: 1 }}>
                  {renderField(depCp)}
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    )
  }

  const pageData = pages[currentPage] || []

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (isDraft = false) => {
    const menuId = 1
    const date = new Date()
    const dateTime = date.toISOString().slice(0, 19).replace("T", " ")

    navigator.geolocation.getCurrentPosition((pos) => {
      const latLong = `${pos.coords.latitude}, ${pos.coords.longitude}`
      const activityId = `${dateTime.replace(/\D/g, "")}_${latLong.replace(/[^0-9]/g, "")}`

      const submitData = async () => {
        const textData = {}
        const imageData = {}

        for (const cp of checkpoints) {
          const id = cp.CheckpointId.toString()
          const type = getType(cp.TypeId).toLowerCase()
          const value = formData[id]

          // Skip if this is a dependent field with parent ID
          const parentId = getParentId(cp.CheckpointId)

          if (parentId) {
            // For dependent fields, use combined ID format: parentId_dependentId
            const combinedId = `${parentId}_${cp.CheckpointId}`

            if (type === "pic/camera") {
              if (value) {
                const base64 = await convertToBase64(value)
                imageData[combinedId] = base64
              }
            } else if (
              value === undefined ||
              value === null ||
              (typeof value === "string" && value.trim() === "") ||
              (Array.isArray(value) && value.length === 0)
            ) {
              textData[combinedId] = null
            } else {
              textData[combinedId] = Array.isArray(value) ? value.join(",") : value
            }

            continue // Skip adding with regular ID
          }

          if (type === "pic/camera") {
            if (value) {
              const base64 = await convertToBase64(value)
              imageData[id] = base64
            }
            continue // Skip adding to textData
          }

          if (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0)
          ) {
            textData[id] = null
          } else {
            textData[id] = Array.isArray(value) ? value.join(",") : value
          }
        }

        try {
          await axios.post("https://namami-infotech.com/SANCHAR/src/menu/add_transaction.php", {
            menuId,
            ActivityId: activityId,
            LatLong: latLong,
            Draft: isDraft ? 1 : 0,
            data: textData,
          })

          if (Object.keys(imageData).length > 0) {
            await axios.post("https://namami-infotech.com/SANCHAR/src/menu/add_image.php", {
              menuId,
              ActivityId: activityId,
              LatLong: latLong,
              data: imageData,
            })
          }

          Swal.fire("Success", isDraft ? "Draft saved successfully!" : "Form submitted successfully!", "success")
          navigate("/tender")
        } catch (error) {
          console.error("Submission error", error)
          Swal.fire("Error", "Submission failed", "error")
        }
      }

      submitData() // call the async inner function
    })
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  return (
    // Update only styles & spacing for more compact layout:
    <Box sx={{ mt: 1, px: 1 }}>
      <Box
        sx={{
          background: "linear-gradient(to right, #F69320, #FFC107)",
          color: "white",
          py: 1,
          borderRadius: 1,
          textAlign: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">{currentPage >= 3 ? "Letter Of Allotment" : "Tender Application Form"}</Typography>
        <Typography variant="body2">
          {currentPage >= 3 ? "Please complete the Letter Of Allotment details" : "Please complete all sections"}
        </Typography>
      </Box>

      <Stepper activeStep={currentPage} alternativeLabel sx={{ mb: 2 }}>
        {pages.map((_, index) => (
          <Step key={index}>
            <StepLabel>Step {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Render checkpoints for current page */}
      {pageData.map((id) => {
        const cp = checkpoints.find((c) => c.CheckpointId === id)
        if (!cp) return null

        // Skip dependent fields - they will be rendered with their parent
        if (isVisibleDependent(cp.CheckpointId)) {
          return null
        }

        return renderCheckpointWithDependents(cp, pageData)
      })}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        {currentPage > 0 && (
          <Button variant="contained" sx={{ backgroundColor: "#1976d2", minWidth: "100px" }} onClick={handlePrevious}>
            Previous
          </Button>
        )}

        {currentPage === pages.length - 1 ? (
          <>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#999", minWidth: "100px" }}
              onClick={() => handleSubmit(true)} // Save Draft
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#F69320", minWidth: "100px" }}
              onClick={() => {
                const currentIds = pages[currentPage]
                const newErrors = {}

                currentIds.forEach((id) => {
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
                  }
                })

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors)
                  Swal.fire({
                    icon: "error",
                    title: "Missing Required Fields",
                    text: "Please fill all mandatory fields before submitting.",
                  })
                } else {
                  setErrors({})
                  handleSubmit(false)
                }
              }}
            >
              Submit
            </Button>
          </>
        ) : (
          <Button variant="contained" sx={{ backgroundColor: "#F69320", minWidth: "100px" }} onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default AdmissionFormLogic
