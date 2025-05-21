"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  FileText,
  ImageIcon,
  ExternalLink,
  Eye,
  ArrowLeft,
  Award,
  Briefcase,
  FileCheck,
  Calendar,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import logo from "../../assets/images (1).png"

// Custom styled components using template literals
const StyledContainer = ({ children, ...props }) => {
  const style = {
    padding: "10px",
    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
    minHeight: "100vh",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledHeader = ({ children, ...props }) => {
  const style = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    marginBottom: "20px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledCard = ({ children, highlight, ...props }) => {
  const style = {
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "12px",
    background: highlight ? "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)" : "#ffffff",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    position: "relative",
    overflow: "hidden",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledButton = ({ children, primary, ...props }) => {
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
    ...props.style,
  }

  const primaryStyle = {
    ...baseStyle,
    backgroundColor: "#F69320",
    color: "white",
    boxShadow: "0 4px 10px rgba(246, 147, 32, 0.2)",
  }

  const secondaryStyle = {
    ...baseStyle,
    backgroundColor: "#f8f9fa",
    color: "#333",
    border: "1px solid #e0e0e0",
  }

  const style = primary ? primaryStyle : secondaryStyle

  return (
    <button {...props} style={style}>
      {children}
    </button>
  )
}

const StyledTitle = ({ children, level = 1, ...props }) => {
  const baseStyle = {
    margin: "0 0 10px 0",
    fontWeight: "600",
    color: "#333",
    ...props.style,
  }

  let fontSize
  switch (level) {
    case 1:
      fontSize = "24px"
      break
    case 2:
      fontSize = "20px"
      break
    case 3:
      fontSize = "18px"
      break
    default:
      fontSize = "16px"
  }

  const style = { ...baseStyle, fontSize }

  return <h3 style={style}>{children}</h3>
}

const StyledSubtitle = ({ children, ...props }) => {
  const style = {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 15px 0",
    ...props.style,
  }
  return <p style={style}>{children}</p>
}

const StyledGrid = ({ children, columns = 1, ...props }) => {
  const style = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "15px",
    width: "100%",
    ...props.style,
  }

  // Add a resize event listener to handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const gridElements = document.querySelectorAll('[data-grid="true"]')
      gridElements.forEach((el) => {
        el.style.gridTemplateColumns = window.innerWidth < 768 ? "1fr" : "1fr 1fr"
      })
    }

    window.addEventListener("resize", handleResize)
    // Initial call
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div data-grid="true" style={style}>
      {children}
    </div>
  )
}

const StyledFieldBox = ({ children, ...props }) => {
  const style = {
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #eee",
    height: "100%",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
    overflow: "hidden",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.05)",
    },
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledFieldLabel = ({ children, ...props }) => {
  const style = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledFieldValue = ({ children, ...props }) => {
  const style = {
    fontSize: "14px",
    color: "#333",
    wordBreak: "break-word",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

const StyledAvatar = ({ src, alt, size = 100, ...props }) => {
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "8px",
    objectFit: "cover",
    border: "2px solid white",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    ...props.style,
  }
  return <img src={src || "/placeholder.svg"} alt={alt} style={style} />
}

const StyledIconButton = ({ children, onClick, ...props }) => {
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "absolute",
    bottom: "5px",
    right: "5px",
    ":hover": {
      backgroundColor: "white",
      transform: "scale(1.1)",
    },
    ...props.style,
  }
  return (
    <button onClick={onClick} style={style}>
      {children}
    </button>
  )
}

const StyledDivider = (props) => {
  const style = {
    height: "1px",
    width: "100%",
    backgroundColor: "#eee",
    margin: "15px 0",
    ...props.style,
  }
  return <div style={style}></div>
}

const StyledBadge = ({ children, color = "#F69320", ...props }) => {
  const style = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    backgroundColor: color,
    ...props.style,
  }
  return <span style={style}>{children}</span>
}

const StyledLoading = (props) => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    ...props.style,
  }

  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(246, 147, 32, 0.1)",
    borderRadius: "50%",
    borderTop: "4px solid #F69320",
    animation: "spin 1s linear infinite",
  }

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const StyledError = ({ children, ...props }) => {
  const style = {
    textAlign: "center",
    padding: "30px",
    color: "#d32f2f",
    fontSize: "18px",
    ...props.style,
  }
  return <div style={style}>{children}</div>
}

// Icon mapping for field types
const getIconForField = (fieldName) => {
  const fieldNameLower = fieldName.toLowerCase()
  if (fieldNameLower.includes("name")) return <User size={16} />
  if (fieldNameLower.includes("company") || fieldNameLower.includes("organization")) return <Building size={16} />
  if (fieldNameLower.includes("date")) return <Calendar size={16} />
  if (fieldNameLower.includes("address") || fieldNameLower.includes("location")) return <MapPin size={16} />
  if (fieldNameLower.includes("phone") || fieldNameLower.includes("contact")) return <Phone size={16} />
  if (fieldNameLower.includes("email")) return <Mail size={16} />
  if (fieldNameLower.includes("document") || fieldNameLower.includes("certificate")) return <FileCheck size={16} />
  return <Briefcase size={16} />
}

function TempTenderView() {
  const { activityId } = useParams()
  const [details, setDetails] = useState([])
  const [checkpoints, setCheckpoints] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState("")

  // Checkpoint groups
  const sections = {
    "Participants Details": [ 18, 20, 21, 22, 23, 24, 25, 26, 27],
    LOA: [28, 29, 30, 31, 32, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 81, 82],
  }

  const candidateDetailsIds = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12,15, 16, 17,]
  const studentPhotoChkId = 2 // Assume 2 is the image URL

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailsRes, checkpointsRes] = await Promise.all([
          axios.get(
            `https://namami-infotech.com/SANCHAR/src/menu/get_transaction_dtl.php?activityId=${encodeURIComponent(
              activityId,
            )}`,
          ),
          axios.get(`https://namami-infotech.com/SANCHAR/src/menu/get_checkpoints.php`),
        ])

        if (detailsRes.data.success && checkpointsRes.data.success) {
          const checkpointMap = {}
          checkpointsRes.data.data.forEach((cp) => {
            checkpointMap[cp.CheckpointId] = cp.Description
          })
          setCheckpoints(checkpointMap)
          setDetails(detailsRes.data.data)
        } else {
          setError("No details or checkpoints found.")
        }
      } catch (err) {
        setError("Failed to fetch tender details.")
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [activityId])

  const getValueByChkId = (chkId) => {
    const item = details.find((d) => Number.parseInt(d.ChkId) === chkId)
    return item ? item.Value : ""
  }

  // Function to check if a value is an image URL
  const isImageUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return (
      url.startsWith("https://") &&
      (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"))
    )
  }

  // Function to check if a value is a PDF URL
  const isPdfUrl = (url) => {
    if (!url || typeof url !== "string") return false
    return url.startsWith("https://") && url.includes(".pdf")
  }

  // Function to open file in new tab
  const openFileInNewTab = (url) => {
    window.open(url, "_blank")
  }

  const renderStudentDetails = () => {
    const fields = candidateDetailsIds.map((id) => {
      const value = getValueByChkId(id)
      return {
        label: checkpoints[id] || `Checkpoint #${id}`,
        value,
        isImage: isImageUrl(value),
        isPdf: isPdfUrl(value),
      }
    })

    return (
      <StyledCard highlight={true}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <Award size={20} color="#F69320" style={{ marginRight: "10px" }} />
          <StyledTitle level={2}>Tender Participant Details</StyledTitle>
        </div>
        <StyledDivider />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Photo and basic info section */}
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              gap: "20px",
              alignItems: window.innerWidth < 768 ? "center" : "flex-start",
            }}
          >
            {/* Photo Column */}
            <div
              style={{
                flex: "0 0 auto",
                textAlign: "center",
                position: "relative",
                padding: "10px",
                background: "linear-gradient(135deg, #fff8e1 0%, #fffde7 100%)",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              }}
            >
              {isPdfUrl(getValueByChkId(studentPhotoChkId)) ? (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    border: "2px solid white",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    margin: "0 auto 10px auto",
                  }}
                >
                  <FileText size={50} color="#F69320" />
                </div>
              ) : (
                <div style={{ position: "relative", marginBottom: "10px" }}>
                  <StyledAvatar src={getValueByChkId(studentPhotoChkId)} alt="Tender Image" size={120} />
                  {isImageUrl(getValueByChkId(studentPhotoChkId)) && (
                    <StyledIconButton onClick={() => openFileInNewTab(getValueByChkId(studentPhotoChkId))}>
                      <Eye size={16} />
                    </StyledIconButton>
                  )}
                </div>
              )}
              <div style={{ fontSize: "14px", fontWeight: "600", marginTop: "5px" }}>Tender Image</div>
              {isPdfUrl(getValueByChkId(studentPhotoChkId)) && (
                <StyledButton
                  style={{ marginTop: "10px", padding: "6px 12px", fontSize: "12px" }}
                  onClick={() => openFileInNewTab(getValueByChkId(studentPhotoChkId))}
                >
                  <FileText size={14} style={{ marginRight: "5px" }} />
                  View PDF
                </StyledButton>
              )}
            </div>

            {/* Key Details */}
            <div
              style={{ flex: "1", padding: "15px", backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: "12px" }}
            >
              <StyledTitle level={3} style={{ color: "#F69320", marginBottom: "15px" }}>
                Key Information
              </StyledTitle>
              <StyledGrid columns={window.innerWidth < 768 ? 1 : 2}>
                {fields
                  .filter((f, idx) => idx < 4 && !f.isImage && !f.isPdf)
                  .map((field, idx) => (
                    <StyledFieldBox key={idx} style={{ backgroundColor: "white" }}>
                      <StyledFieldLabel>
                        {getIconForField(field.label)}
                        {field.label}
                      </StyledFieldLabel>
                      <StyledFieldValue>{field.value || "—"}</StyledFieldValue>
                    </StyledFieldBox>
                  ))}
              </StyledGrid>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <StyledTitle level={3} style={{ marginBottom: "15px" }}>
              Additional Details
            </StyledTitle>
            <StyledGrid columns={window.innerWidth < 768 ? 1 : 3}>
              {fields
                .filter((f, idx) => idx >= 4 && !f.isImage && !f.isPdf)
                .map((field, idx) => (
                  <StyledFieldBox key={idx}>
                    <StyledFieldLabel>
                      {getIconForField(field.label)}
                      {field.label}
                    </StyledFieldLabel>
                    <StyledFieldValue>{field.value || "—"}</StyledFieldValue>
                  </StyledFieldBox>
                ))}

              {/* Render image and PDF fields separately */}
              {fields
                .filter((f) => f.isImage || f.isPdf)
                .map((field, idx) => (
                  <StyledFieldBox key={`file-${idx}`}>
                    <StyledFieldLabel>
                      {field.isPdf ? <FileText size={16} /> : <ImageIcon size={16} />}
                      {field.label}
                    </StyledFieldLabel>
                    {field.isImage ? (
                      <StyledButton
                        style={{ marginTop: "5px", padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(field.value)}
                      >
                        <ImageIcon size={14} style={{ marginRight: "5px" }} />
                        View Image
                      </StyledButton>
                    ) : field.isPdf ? (
                      <StyledButton
                        style={{ marginTop: "5px", padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => openFileInNewTab(field.value)}
                      >
                        <FileText size={14} style={{ marginRight: "5px" }} />
                        View PDF
                      </StyledButton>
                    ) : null}
                  </StyledFieldBox>
                ))}
            </StyledGrid>
          </div>
        </div>
      </StyledCard>
    )
  }

  const renderSection = (title, checkpointIds) => {
    const sectionData = details.filter((item) => {
      const baseId = Number.parseInt(item.ChkId.toString().split("_")[0])
      return checkpointIds.includes(baseId)
    })

    if (sectionData.length === 0) return null

    const getLabel = (chkId) => {
      if (chkId.includes("_")) {
        const [parentId, childId] = chkId.split("_")
        const parentLabel = checkpoints[parentId] || `Checkpoint #${parentId}`
        const childLabel = checkpoints[childId] || `Checkpoint #${childId}`
        return `${childLabel} (${parentLabel})`
      } else {
        return checkpoints[chkId] || `Checkpoint #${chkId}`
      }
    }

    // Group data by parent ID for better organization
    const groupedData = {}
    sectionData.forEach((item) => {
      const baseId = item.ChkId.toString().split("_")[0]
      if (!groupedData[baseId]) {
        groupedData[baseId] = []
      }
      groupedData[baseId].push(item)
    })

    return (
      <StyledCard key={title}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <FileCheck size={20} color="#F69320" style={{ marginRight: "10px" }} />
          <StyledTitle level={2}>{title}</StyledTitle>
        </div>
        <StyledDivider />

        {Object.entries(groupedData).map(([parentId, items], groupIndex) => (
          <div key={`group-${parentId}`} style={{ marginBottom: "20px" }}>
            {items.length > 1 && (
              <StyledTitle level={3} style={{ marginBottom: "10px", color: "#555" }}>
                {checkpoints[parentId] || `Group ${groupIndex + 1}`}
              </StyledTitle>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr",
                gap: "15px",
                width: "100%",
              }}
            >
              {items.map((item, index) => {
                const isImage = isImageUrl(item.Value)
                const isPdf = isPdfUrl(item.Value)

                return (
                  <StyledFieldBox
                    key={`${parentId}-${index}`}
                    style={{
                      backgroundColor: isImage || isPdf ? "rgba(246, 147, 32, 0.05)" : "#f9f9f9",
                      border: isImage || isPdf ? "1px solid rgba(246, 147, 32, 0.2)" : "1px solid #eee",
                    }}
                  >
                    <StyledFieldLabel>
                      {isImage ? (
                        <ImageIcon size={16} />
                      ) : isPdf ? (
                        <FileText size={16} />
                      ) : (
                        getIconForField(getLabel(item.ChkId))
                      )}
                      {getLabel(item.ChkId)}
                    </StyledFieldLabel>

                    {isImage ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ position: "relative", marginBottom: "10px" }}>
                          <img
                            src={item.Value || "/placeholder.svg"}
                            alt={getLabel(item.ChkId)}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "2px solid white",
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <StyledIconButton onClick={() => openFileInNewTab(item.Value)}>
                            <Eye size={16} />
                          </StyledIconButton>
                        </div>
                        <StyledButton
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => openFileInNewTab(item.Value)}
                        >
                          <ExternalLink size={14} style={{ marginRight: "5px" }} />
                          Open Image
                        </StyledButton>
                      </div>
                    ) : isPdf ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#F69320",
                            backgroundColor: "rgba(246, 147, 32, 0.1)",
                            marginBottom: "10px",
                          }}
                        >
                          <FileText size={12} style={{ marginRight: "5px" }} />
                          PDF Document
                        </div>
                        <StyledButton
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => openFileInNewTab(item.Value)}
                        >
                          <ExternalLink size={14} style={{ marginRight: "5px" }} />
                          Open PDF
                        </StyledButton>
                      </div>
                    ) : (
                      <StyledFieldValue>{item.Value || "—"}</StyledFieldValue>
                    )}
                  </StyledFieldBox>
                )
              })}
            </div>
          </div>
        ))}
      </StyledCard>
    )
  }

  if (loading) {
    return <StyledLoading />
  }

  if (error) {
    return (
      <StyledError>
        <div style={{ fontSize: "24px", marginBottom: "15px" }}>{error}</div>
        <StyledButton primary onClick={() => navigate(-1)}>
          <ArrowLeft size={16} style={{ marginRight: "5px" }} />
          Go Back
        </StyledButton>
      </StyledError>
    )
  }

  return (
    <StyledContainer>
      {/* Header with Back button */}
      <StyledHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <StyledButton
            primary
            onClick={() => navigate(-1)}
            style={{ padding: "8px", borderRadius: "50%", minWidth: "40px", minHeight: "40px" }}
          >
            <ArrowLeft size={20} />
          </StyledButton>

          <div>
            <StyledTitle level={1} style={{ color: "#F69320", margin: 0 }}>
              SANCHHAR RAILWAY TENDERS
            </StyledTitle>
            <StyledSubtitle style={{ margin: 0 }}>TENDER Form Details</StyledSubtitle>
          </div>
        </div>

        {/* Logo with decorative elements */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "-10px",
              right: "-10px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              zIndex: 0,
            }}
          ></div>
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo"
            style={{
              maxHeight: "50px",
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          />
        </div>
      </StyledHeader>

      {/* Main Content */}
      <div style={{ margin: "0 auto" }}>
        {/* Tender Details */}
        {renderStudentDetails()}

        {/* Remaining Sections */}
        {Object.entries(sections).map(([sectionTitle, ids]) => renderSection(sectionTitle, ids))}
      </div>

      {/* Add a floating action button for quick navigation back to top */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <StyledButton
          primary
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            padding: 0,
            boxShadow: "0 4px 15px rgba(246, 147, 32, 0.3)",
          }}
        >
          <ArrowLeft size={24} style={{ transform: "rotate(90deg)" }} />
        </StyledButton>
      </div>

      {/* Add global styles */}
      <style>{`
        * {
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </StyledContainer>
  )
}

export default TempTenderView
