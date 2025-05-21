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
  const navigate = useNavigate()

  const handleChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: false }))

    // If this is a file input, mark it as changed
    if (value && typeof value === "object" && value instanceof File) {
      setChangedFiles((prev) => ({ ...prev, [id]: true }))
    }

    // Handle dependencies when value changes
    updateDependentFields(id, value)
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

              // Store the dependent field value using the dependentId as the key
              existingData[dependentId] = value

              console.log(`Loading dependent field ${dependentId} with parent ${parentId}, value:`, value)

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
    const menuId = 1
    const date = new Date()
    const dateTime = date.toISOString().slice(0, 19).replace("T", " ")

    navigator.geolocation.getCurrentPosition((pos) => {
      const latLong = `${pos.coords.latitude}, ${pos.coords.longitude}`

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
              // Only include image data if it's a new file (File object) or marked as changed
              if (value && typeof value === "object" && value instanceof File) {
                const base64 = await convertToBase64(value)
                imageData[combinedId] = base64
              }
              // Do NOT include existing image data that hasn't changed
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
            // Only include image data if it's a new file (File object) or marked as changed
            if (value && typeof value === "object" && value instanceof File) {
              const base64 = await convertToBase64(value)
              imageData[id] = base64
            }
            // Do NOT include existing image data that hasn't changed
            continue
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
          // ✅ Use update_transaction.php instead of add_transaction.php
          await axios.post("https://namami-infotech.com/SANCHAR/src/menu/update_transaction.php", {
            menuId,
            ActivityId,
            LatLong: latLong,
            // DateTime: dateTime,
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
              // DateTime: dateTime,
              data: imageData,
            })
          } else {
            console.log("No image data changes to send")
          }

          Swal.fire("Success", isDraft ? "Draft updated successfully!" : "Form updated successfully!", "success")
          navigate("/tender")
        } catch (err) {
          console.error("Update error:", err)
          Swal.fire("Error", "Update failed", "error")
        }
      }

      submitData()
    })
  }

  const renderField = (cp) => {
    const type = getType(cp.TypeId).toLowerCase()
    const id = cp.CheckpointId.toString()
    // Use nullish coalescing to handle null values properly
    const value = formData[id] ?? (type === "checkbox" ? [] : "")
    console.log(`Rendering field ${id} (${cp.Description}) with value:`, value)
    const options = cp.Options ? cp.Options.split(",") : []
    const error = errors[id]
    const editable = cp.Editable === 1

    if (type.includes("header")) {
      return (
        <Typography variant="h6" align="center">
          {cp.Description}
        </Typography>
      )
    }

    if (type.includes("description")) {
      return <Typography>{cp.Description}</Typography>
    }

    return (
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Typography>{cp.Description}</Typography>
        </Grid>
        <Grid item xs={8}>
          {(() => {
            switch (type) {
              case "text":
                return (
                  <TextField
                    fullWidth
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                )
              case "email":
                return (
                  <TextField
                    fullWidth
                    type="email"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                )
              case "digit":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                )
              case "number":
                return (
                  <TextField
                    fullWidth
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                )
              case "long text":
                return (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
                  />
                )
              case "date":
                return (
                  <TextField
                    fullWidth
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(id, e.target.value)}
                    error={error}
                    helperText={error ? "Required" : ""}
                    disabled={!editable}
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
                      handleChange(id, finalValue)
                    }}
                    disabled={!editable}
                    renderInput={(params) => (
                      <TextField {...params} error={error} helperText={error ? "Required" : ""} />
                    )}
                  />
                )

              case "radio":
                return (
                  <>
                    <RadioGroup row value={value} onChange={(e) => handleChange(id, e.target.value)}>
                      {options.map((opt) => (
                        <FormControlLabel key={opt} value={opt} control={<Radio disabled={!editable} />} label={opt} />
                      ))}
                    </RadioGroup>
                    {error && <Typography color="error">Required</Typography>}
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

                              handleChange(id, newValue)
                            }}
                            disabled={!editable}
                          />
                        }
                        label={opt}
                      />
                    ))}
                  </FormGroup>
                )
              case "pic/camera":
                return (
                  <>
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

                    <TextField
                      fullWidth
                      type="file"
                      inputProps={{ accept: "image/*,.pdf" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleChange(id, e.target.files[0])
                        }
                      }}
                      disabled={!editable}
                    />
                  </>
                )

              default:
                return <TextField disabled size="small" />
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

    if (dependentIds.length > 0) {
      console.log(`Parent ${cp.CheckpointId} (${cp.Description}) has dependents:`, dependentIds)
      dependentCheckpoints.forEach((depCp) => {
        console.log(
          `  - Dependent ${depCp.CheckpointId} (${depCp.Description}) has value:`,
          formData[depCp.CheckpointId],
        )
      })
    }

    console.log(`Rendering checkpoint ${cp.CheckpointId} with dependents:`, dependentIds)

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

  const handleNext = () => setCurrentPage((prev) => prev + 1)
  const handlePrevious = () => setCurrentPage((prev) => prev - 1)

  return (
    <Box sx={{ mt: 2, px: 1 }}>
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
        <Typography variant="h5">Tender Application Form</Typography>
        <Typography variant="body2">Please complete all sections</Typography>
      </Box>

      <Stepper activeStep={currentPage} alternativeLabel sx={{ mb: 2 }}>
        {pages.map((_, index) => (
          <Step key={index}>
            <StepLabel>Step {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Render checkpoints for current page */}
      {pageData?.map((id) => {
        const cp = checkpoints.find((c) => c.CheckpointId === id)
        if (!cp) return null

        // Skip dependent fields - they will be rendered with their parent
        if (isVisibleDependent(cp.CheckpointId)) {
          return null
        }

        return renderCheckpointWithDependents(cp, pageData)
      })}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        {currentPage < pages.length - 1 ? (
          <>
            {currentPage > 0 && (
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{ color: "#F69320", borderColor: "#F69320", mr: 1 }}
              >
                Previous
              </Button>
            )}
            <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: "#F69320" }}>
              Next
            </Button>
          </>
        ) : (
          <>
            {currentPage > 0 && (
              <Button
                variant="outlined"
                onClick={handlePrevious}
                sx={{ color: "#F69320", borderColor: "#F69320", mr: 1 }}
              >
                Previous
              </Button>
            )}
            <Button variant="contained" onClick={() => handleSubmit(true)} sx={{ backgroundColor: "#999", mr: 1 }}>
              Save Draft
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const newErrors = {}
                checkpoints.forEach((cp) => {
                  const id = cp.CheckpointId.toString()
                  const value = formData[id]
                  const type = getType(cp.TypeId).toLowerCase()

                  if (
                    cp?.Mandatory === 1 &&
                    !["header", "description"].includes(type) &&
                    (value === undefined || value === "" || (Array.isArray(value) && value.length === 0))
                  ) {
                    newErrors[id] = true
                  }
                })

                if (Object.keys(newErrors).length > 0) {
                  setErrors(newErrors)
                  Swal.fire("Missing Fields", "Please fill all required fields", "error")
                } else {
                  setErrors({})
                  handleSubmit(false)
                }
              }}
              sx={{ backgroundColor: "#F69320" }}
            >
              Submit
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}

export default EditDraft
