import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Group } from "react-konva";
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

  // Valeur spéciale pour l'option "Nouveau badge"
  const NEW_BADGE_OPTION = "___new_badge___";

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
      x: 150,
      y: 180,
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
    const newImg = {
      id: `image-${Date.now()}`,
      type: "image",
      src: url,
      x: 50,
      y: 50,
      width: 100,
      height: 100
    };
    setElements([...elements, newImg]);
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

  const downloadBadge = () => {
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "badge.png";
    link.click();
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
            Télécharger le Badge
          </Button>
          <Button variant="outlined" color="primary" onClick={saveModel}>
            Sauvegarder Modèle
          </Button>
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
          width={844}
          height={400}
          onMouseDown={handleDeselect}
          ref={stageRef}
          style={{ border: `2px solid ${primaryColor}`, borderRadius: '10px', backgroundColor: '#fff' }}
        >
          <Layer>
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