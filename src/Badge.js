import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer, Group } from "react-konva";
import useImage from "use-image";
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Container,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Avatar,
  Tooltip,
  Divider,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Image from './Image1.jpg';

// Couleurs
const primaryColor = '#d32f2f';
const secondaryColor = '#1976d2';
const accentColor = '#ff4081';
const backgroundColor = '#f5f5f5';
const textColor = '#333';

// Liste des polices possibles
const fontFamilies = ["Arial", "Times New Roman", "Verdana", "Courier New"];

// Composant Image Konva
const URLImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const [image] = useImage(shapeProps.src, 'anonymous');

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;
  return (
    <Group>
      <KonvaImage
        image={image}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(50, node.width() * scaleX),
            height: Math.max(50, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 50 || newBox.height < 50 ? oldBox : newBox
          }
        />
      )}
    </Group>
  );
};

const KonvaText = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <Group>
      <Text
        ref={shapeRef}
        {...shapeProps}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragEnd={e => onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={e => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(12, shapeProps.fontSize * Math.max(scaleX, scaleY)),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
          }
        />
      )}
    </Group>
  );
};

const Badge = () => {
  const navigate = useNavigate();
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [editingText, setEditingText] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const stageRef = useRef();
  
  // État pour le guidage visuel (rectangle en pointillés)
  const [showGuide, setShowGuide] = useState(true);

  // Référence pour le rectangle de guidage
  const guideRectRef = useRef(null);

  // Valeur spéciale pour l'option "Nouveau badge"
  const NEW_BADGE_OPTION = "___new_badge___";

  // Dimensions du badge (ratio largeur/hauteur = 3.370/2.125)
  const BADGE_RATIO = 3.370 / 2.125;
  
  // Dimensions de la zone d'édition
  const STAGE_WIDTH = 844;
  const STAGE_HEIGHT = Math.round(STAGE_WIDTH / BADGE_RATIO);

  // Récupérer l'utilisateur connecté et ses modèles
  useEffect(() => {
    const userSessionData = sessionStorage.getItem('user');
    
    if (!userSessionData) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      navigate('/');
      return;
    }

    const user = JSON.parse(userSessionData);
    setCurrentUser(user);
    
    // Charger les modèles de l'utilisateur
    loadUserModels(user.sub);
  }, [navigate]);

  // Fonction pour générer une clé de stockage utilisateur unique
  const getUserStorageKey = (userId, modelName) => {
    return `user_${userId}_model_${modelName}`;
  };

  // Fonction pour charger tous les modèles de l'utilisateur
  const loadUserModels = (userId) => {
    const userModels = [];
    const userPrefix = `user_${userId}_model_`;
    
    // Parcourir tout le localStorage pour trouver les modèles de l'utilisateur
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(userPrefix)) {
        // Extraire le nom du modèle de la clé
        const modelName = key.replace(userPrefix, '');
        userModels.push(modelName);
      }
    }
    
    setModels(userModels);
  };

  const handleLogout = () => {
    // Supprimer les informations de session
    sessionStorage.removeItem('user');
    // Rediriger vers la page de connexion
    navigate('/');
  };

  const handleDeselect = e => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      setEditingText(false);
    }
  };

  const addText = () => {
    if (!textValue.trim()) return;
    
    const newText = {
      id: `text-${Date.now()}`,
      type: "text",
      text: textValue,
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2,
      fontSize: 24,
      fontFamily: "Arial",
      fill: textColor,
      draggable: true,
      fontStyle: "normal",
      textDecoration: "none"
    };
    setElements([...elements, newText]);
    setTextValue("");
  };

  const addImage = url => {
    // Create a temporary image object to get the natural dimensions
    const tempImg = new Image();
    tempImg.onload = () => {
      // Get the image's natural width and height
      const naturalWidth = tempImg.width;
      const naturalHeight = tempImg.height;
      
      // Calculate the aspect ratio of the image
      const imageRatio = naturalWidth / naturalHeight;
      
      // Calculate dimensions that fit the badge area while preserving aspect ratio
      let width, height;
      
      // Use a larger percentage of the badge area (e.g., 70-80%)
      const targetWidth = STAGE_WIDTH * 0.8;
      const targetHeight = STAGE_HEIGHT * 0.8;
      
      if (imageRatio > BADGE_RATIO) {
        // Image is wider than the badge ratio
        width = targetWidth;
        height = width / imageRatio;
      } else {
        // Image is taller than the badge ratio
        height = targetHeight;
        width = height * imageRatio;
      }
      
      // Calculate position to center the image
      const x = (STAGE_WIDTH - width) / 2;
      const y = (STAGE_HEIGHT - height) / 2;
      
      // Create new image element with calculated dimensions
      const newImg = {
        id: `image-${Date.now()}`,
        type: "image",
        src: url,
        x: x,
        y: y,
        width: width,
        height: height,
      };
      
      // Add the image to elements
      setElements(prevElements => [...prevElements, newImg]);
    };
    
    // Set the source to trigger the onload event
    tempImg.src = url;
  };

  const updateElement = updatedProps => {
    setElements(elements.map(el => el.id === updatedProps.id ? updatedProps : el));
  };

  const deleteElement = idToDelete => {
    setElements(elements.filter(el => el.id !== idToDelete));
    setSelectedId(null);
    setEditingText(false);
  };

  const handleTextEdit = () => {
    setElements(elements.map(el =>
      el.id === selectedId ? { ...el, text: textValue } : el
    ));
    setEditingText(false);
  };

  const handleSelect = id => {
    setSelectedId(id);
    const sel = elements.find(el => el.id === id);
    if (sel?.type === 'text') {
      setTextValue(sel.text);
      setEditingText(true);
    } else {
      setEditingText(false);
      setTextValue("");
    }
  };

  const handleDeleteSelected = () => {
    if (selectedId) deleteElement(selectedId);
  };

  // Fonction révisée pour le téléchargement du badge
  const downloadBadge = () => {
    // Désactiver temporairement la sélection
    const previousSelectedId = selectedId;
    setSelectedId(null);
    
    // Cacher temporairement le rectangle de guidage si présent
    setShowGuide(false);
    
    // Utiliser un délai pour s'assurer que l'état a été mis à jour
    setTimeout(() => {
      if (!stageRef.current) {
        console.error("Référence au stage non disponible");
        return;
      }
      
      try {
        // Créer une copie hors écran (canvas) pour manipuler l'image
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = 3370;
        offscreenCanvas.height = 2125;
        const ctx = offscreenCanvas.getContext('2d');
        
        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        
        // Obtenir l'image de la scène
        const uri = stageRef.current.toDataURL({
          pixelRatio: 1,
          mimeType: 'image/png'
        });
        
        // Créer une image temporaire pour manipuler les données
        const tempImg = new Image();
        tempImg.onload = () => {
          // Calculer les facteurs d'échelle
          const scaleX = offscreenCanvas.width / STAGE_WIDTH;
          const scaleY = offscreenCanvas.height / STAGE_HEIGHT;
          
          // Dessiner l'image redimensionnée sur le canvas
          ctx.drawImage(
            tempImg, 
            0, 0, tempImg.width, tempImg.height,  // Source rectangle
            0, 0, offscreenCanvas.width, offscreenCanvas.height  // Destination rectangle (full size)
          );
          
          // Convertir le canvas en URL de données
          const finalDataURL = offscreenCanvas.toDataURL('image/png');
          
          // Créer un lien de téléchargement et le déclencher
          const link = document.createElement('a');
          link.download = 'badge_3370x2125.png';
          link.href = finalDataURL;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Restaurer l'affichage du guide et la sélection
          setShowGuide(true);
          if (previousSelectedId) {
            setSelectedId(previousSelectedId);
          }
        };
        
        tempImg.src = uri;
      } catch (error) {
        console.error("Erreur lors du téléchargement:", error);
        alert("Une erreur s'est produite lors de la génération du badge. Veuillez réessayer.");
        
        // Restaurer l'affichage du guide en cas d'erreur
        setShowGuide(true);
        if (previousSelectedId) {
          setSelectedId(previousSelectedId);
        }
      }
    }, 50);
  };

  const saveModel = () => {
    if (!currentUser) return;
    
    const name = prompt("Nom du modèle ?");
    if (name && name.trim()) {
      // Créer une clé de stockage unique basée sur l'ID utilisateur
      const storageKey = getUserStorageKey(currentUser.sub, name);
      localStorage.setItem(storageKey, JSON.stringify(elements));
      
      // Rafraîchir la liste des modèles
      loadUserModels(currentUser.sub);
      
      // Définir ce modèle comme le modèle sélectionné
      setSelectedModel(name);
    }
  };

  const handleModelChange = (event) => {
    const selectedValue = event.target.value;
    
    if (selectedValue === NEW_BADGE_OPTION) {
      // C'est l'option "Nouveau badge"
      createNewBadge();
      return;
    }
    
    // C'est un modèle existant
    loadModel(selectedValue);
  };

  const loadModel = name => {
    if (!currentUser || !name) return;
    
    const storageKey = getUserStorageKey(currentUser.sub, name);
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      setElements(JSON.parse(data));
      setSelectedModel(name);
      setSelectedId(null);
    }
  };

  const deleteModel = () => {
    if (!currentUser || !selectedModel) return;
    
    const storageKey = getUserStorageKey(currentUser.sub, selectedModel);
    localStorage.removeItem(storageKey);
    
    // Rafraîchir la liste des modèles
    loadUserModels(currentUser.sub);
    setSelectedModel("");
    // Réinitialiser le badge à vide
    setElements([]);
  };

  const createNewBadge = () => {
    setElements([]);
    setSelectedModel("");
    setSelectedId(null);
    setEditingText(false);
    setTextValue("");
  };

  const sel = elements.find(el => el.id === selectedId) || {};

  // Composant de téléchargement alternatif en tant que bouton séparé
  const DownloadButton = () => {
    return (
      <button 
        style={{
          backgroundColor: primaryColor,
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          margin: '10px'
        }}
        onClick={() => {
          // Approche alternative utilisant l'API du navigateur
          const canvas = stageRef.current.toCanvas({
            pixelRatio: 2,
            width: 3370,
            height: 2125
          });
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = 'badge_3370x2125.png';
              link.href = url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            } else {
              console.error("Erreur lors de la génération du blob");
              alert("Une erreur s'est produite. Veuillez réessayer.");
            }
          }, 'image/png');
        }}
      >
        Télécharger Badge (méthode alternative)
      </button>
    );
  };

  return (
    <Box sx={{ backgroundColor, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <AppBar position="static" sx={{ backgroundColor: primaryColor }}>
        <Toolbar>
          <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img alt="logo" src={Image} style={{ marginRight: 16, height: 60 }} />
              <Typography variant="h6">
                Ehs Mohamed Abderrahmani cardio-vasculaire
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {currentUser && (
                <Tooltip title={currentUser.name || 'Utilisateur'}>
                  <Avatar 
                    src={currentUser.picture} 
                    alt={currentUser.name || 'User'} 
                    sx={{ mr: 2 }}
                  />
                </Tooltip>
              )}
              <IconButton color="inherit" onClick={handleLogout} title="Déconnexion">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ color: primaryColor, fontWeight: 'bold', mb: 2 }}>
          Éditeur de Badge Personnalisé
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', textAlign: 'center' }}>
          Dimensions de la carte: 3,370" x 2,125" (Format Badge Standard)
        </Typography>

        {sel.type === 'text' && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 , justifyContent: 'center'}}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Police</InputLabel>
              <Select
                value={sel.fontFamily}
                label="Police"
                onChange={e => updateElement({ ...sel, fontFamily: e.target.value })}
              >
                {fontFamilies.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Taille"
              size="small"
              value={sel.fontSize}
              onChange={e => updateElement({ ...sel, fontSize: parseInt(e.target.value, 10) })}
              sx={{ width: 80 }}
            />

            <TextField
              type="color"
              size="small"
              value={sel.fill}
              onChange={e => updateElement({ ...sel, fill: e.target.value })}
              sx={{ width: 60 }}
            />

            <Button
              variant={sel.fontStyle.includes("bold") ? "contained" : "outlined"}
              onClick={() => {
                const hasBold = sel.fontStyle.includes("bold");
                const styles = sel.fontStyle.split(" ").filter(s => s && s !== "bold");
                if (!hasBold) styles.push("bold");
                updateElement({ ...sel, fontStyle: styles.join(" ") });
              }}
            >Gras</Button>

            <Button
              variant={sel.fontStyle.includes("italic") ? "contained" : "outlined"}
              onClick={() => {
                const hasIt = sel.fontStyle.includes("italic");
                const styles = sel.fontStyle.split(" ").filter(s => s && s !== "italic");
                if (!hasIt) styles.push("italic");
                updateElement({ ...sel, fontStyle: styles.join(" ") });
              }}
            >Italique</Button>

            <Button
              variant={sel.textDecoration === "underline" ? "contained" : "outlined"}
              onClick={() =>
                updateElement({ ...sel, textDecoration: sel.textDecoration === "underline" ? "none" : "underline" })
              }
            >Souligné</Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
          <TextField
            label="Texte à ajouter"
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            size="small"
            sx={{ width: 300 }}
          />
          <Button variant="contained" sx={{ backgroundColor: secondaryColor }} onClick={addText}>
            Ajouter Texte
          </Button>
          <Button variant="contained" component="label" sx={{ backgroundColor: accentColor }}>
            Ajouter Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => addImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>
        </Box>

        {editingText && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
            <TextField
              label="Modifier le texte"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
            <Button variant="contained" sx={{ backgroundColor: secondaryColor }} onClick={handleTextEdit}>
              Mettre à jour
            </Button>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={!selectedId}
          >
            Supprimer l'élément
          </Button>
          <Button variant="contained" sx={{ backgroundColor: primaryColor }} onClick={downloadBadge}>
            Télécharger le Badge (3,370" x 2,125")
          </Button>
          <Button variant="outlined" color="primary" onClick={saveModel}>
            Sauvegarder Modèle
          </Button>
        </Box>

        {/* Bouton de téléchargement alternatif */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <DownloadButton />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 230 }}>
            <InputLabel>Modèle</InputLabel>
            <Select
              value={selectedModel}
              label="Modèle"
              onChange={handleModelChange}
              displayEmpty
            >
              <MenuItem value={NEW_BADGE_OPTION} sx={{ color: secondaryColor, fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AddCircleOutlineIcon sx={{ mr: 1 }} />
                  Nouveau Badge
                </Box>
              </MenuItem>
              
              {models.length > 0 && <Divider sx={{ my: 1 }} />}
              
              {models.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={deleteModel} 
            disabled={!selectedModel || selectedModel === NEW_BADGE_OPTION}
          >
            Supprimer Modèle
          </Button>
        </Box>

        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT} // Modifié pour respecter le ratio 3.370:2.125
          onMouseDown={handleDeselect}
          ref={stageRef}
          style={{ 
            border: `2px solid ${primaryColor}`, 
            borderRadius: '10px', 
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Layer>
            {/* Rectangle pour indiquer les limites du badge - à cacher lors du téléchargement */}
            {showGuide && (
              <Rect
                x={0}
                y={0}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                stroke="#BBBBBB"
                strokeWidth={1}
                dash={[5, 5]}
                fill="transparent"
                ref={guideRectRef}
              />
            )}
            
            {elements.map(el =>
              el.type === "text" ? (
                <KonvaText
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => handleSelect(el.id)}
                  onChange={updateElement}
                />
              ) : (
                <URLImage
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => handleSelect(el.id)}
                  onChange={updateElement}
                />
              )
            )}
          </Layer>
        </Stage>
      </Container>
    </Box>
  );
};

export default Badge;