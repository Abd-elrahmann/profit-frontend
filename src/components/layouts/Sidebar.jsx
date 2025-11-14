import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Collapse
} from '@mui/material';
import { 
  MdExitToApp as ExitToApp,
  MdExpandMore as ExpandMoreIcon,
  MdExpandLess as ExpandLessIcon
} from 'react-icons/md';
import { getSidebarMenuItems } from '../../routes';
import { usePermissions } from '../Contexts/PermissionsContext';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [openGroup, setOpenGroup] = useState(null);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const { permissions, loading } = usePermissions();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Update filtered menu items when permissions change
  useEffect(() => {
    const menuItems = getSidebarMenuItems();
    
    const filtered = menuItems.filter(item => {
      if (!item.requiresPermissions) return true;
      if (item.children) {
        const filteredChildren = item.children.filter(child => permissions.includes(`${child.module}_View`));
        return filteredChildren.length > 0;
      }
      return permissions.includes(`${item.module}_View`);
    });
    
    setFilteredMenuItems(filtered);
  }, [permissions]);

  const singleItems = filteredMenuItems.filter(item => !item.children);
  const groupItems = filteredMenuItems.filter(item => item.children);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('rememberedEmail');
    navigate('/login', { replace: true });
  };

  const toggleGroup = (groupLabel) => {
    setOpenGroup(prev => prev === groupLabel ? null : groupLabel);
  };

  const renderSingleMenuItem = (item, index) => {
    return (
      <ListItem
        key={item.path}
        component={NavLink}
        to={item.path}
        onClick={onClose}
        sx={{
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          borderRadius: 2,
          mb: 1,
          mt: index === 0 ? 2 : 0,
          textDecoration: 'none',
          color: 'text.primary',
          opacity: isOpen ? 1 : 0,
          transition: `all 0.1s ease-out ${index * 0.02}s`,
          '&:hover': {
            backgroundColor: '#C7D2FE',
            transform: isOpen ? 'translateX(-4px) scale(1.02)' : 'translateX(30px)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
          },
          '&.active': {
            backgroundColor: '#C7D2FE',
            borderRight: '4px solid',
            borderRightColor: '#3B82F6',
            '& .MuiListItemIcon-root': {
              color: 'primary.main'
            },
            '& .MuiListItemText-primary': {
              color: 'primary.main',
              fontWeight: 600
            }
          }
        }}
      >
        <ListItemText
          primary={item.label}
          sx={{
            '& .MuiListItemText-primary': {
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'text.primary',
              textAlign: 'right'
            }
          }}
        />
        {item.icon && (
          <ListItemIcon sx={{ 
            minWidth: 0,
            marginLeft: '10px',
            justifyContent: 'center',
            color: 'text.primary',
            transition: 'transform 0.03s ease',
            transform: isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(180deg)',
            '& > *': {
              fontSize: '1.3rem !important'
            }
          }}>
            <item.icon />
          </ListItemIcon>
        )}
      </ListItem>
    );
  };

  const renderGroupMenuItem = (item, index) => {
    const isGroupOpen = openGroup === item.label;
    
    // Filter children based on permissions - this will be recalculated when permissions change
    const filteredChildren = item.children.filter(child => 
      !child.requiresPermissions || permissions.includes(`${child.module}_View`)
    );

    if (filteredChildren.length === 0) return null;

    return (
      <Box key={item.label}>
        <ListItem
          button
          onClick={() => toggleGroup(item.label)}
          sx={{
            flexDirection: 'row-reverse',
            justifyContent: 'space-between',
            borderRadius: 2,
            mb: 1,
            mt: index === 0 && singleItems.length === 0 ? 2 : 0,
            textDecoration: 'none',
            color: 'text.primary',
            opacity: isOpen ? 1 : 0,
            transition: `all 0.1s ease-out ${index * 0.02}s`,
            '&:hover': {
              backgroundColor: '#C7D2FE',
              cursor: 'pointer',
              transform: isOpen ? 'translateX(-4px) scale(1.02)' : 'translateX(30px)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }
          }}
        >
          <ListItemText
            primary={item.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'text.primary',
                textAlign: 'right'
              }
            }}
          />
          <ListItemIcon sx={{ 
            minWidth: 0,
            marginLeft: '10px',
            justifyContent: 'center',
            color: 'text.primary',
            transition: 'transform 0.03s ease',
            transform: isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(180deg)',
          }}>
            {isGroupOpen ? <ExpandLessIcon size={20} /> : <ExpandMoreIcon size={20} />}
          </ListItemIcon>
        </ListItem>
        
        <Collapse in={isGroupOpen && isOpen} timeout="auto">
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {filteredChildren.map((child, childIndex) => (
              <ListItem
                key={child.path}
                component={NavLink}
                to={child.path}
                onClick={onClose}
                sx={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  mb: 1,
                  textDecoration: 'none',
                  color: 'text.primary',
                  opacity: isOpen ? 1 : 0,
                  transition: `all 0.1s ease-out ${childIndex * 0.02}s`,
                  '&:hover': {
                    backgroundColor: '#C7D2FE',
                    transform: isOpen ? 'translateX(-4px) scale(1.02)' : 'translateX(30px)',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                  },
                  '&.active': {
                    backgroundColor: '#C7D2FE',
                    borderRight: '4px solid',
                    borderRightColor: '#3B82F6',
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main'
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 600
                    }
                  }
                }}
              >
                <ListItemText
                  primary={child.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                      fontWeight: 400,
                      color: 'text.primary',
                      textAlign: 'right'
                    }
                  }}
                />
                {child.icon && (
                  <ListItemIcon sx={{ 
                    minWidth: 0,
                    marginLeft: '10px',
                    justifyContent: 'center',
                    color: 'text.primary',
                    transition: 'transform 0.03s ease',
                    transform: isOpen ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(180deg)',
                    '& > *': {
                      fontSize: '1.3rem !important'
                    }
                  }}>
                    <child.icon />
                  </ListItemIcon>
                )}
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box
      ref={sidebarRef}
      sx={{
        width: isOpen ? 250 : 0,
        minWidth: isOpen ? 250 : 0,
        flexShrink: 0,
        transition: 'all 0.05s ease-out',
        overflow: 'hidden',
        position: 'fixed',
        top: 64,
        right: isOpen ? 0 : -250,
        bottom: 0,
        zIndex: 1200,
        backgroundColor: 'background.paper',
        borderLeft: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        opacity: isOpen ? 1 : 0,
        transform: `translateX(${isOpen ? 0 : 250}px)`,
        boxShadow: isOpen ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none'
      }}
    >
      <Box
        sx={{
          width: 250,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOpen ? 1 : 0,
          transition: 'all 0.05s ease-out',
          transform: isOpen ? 'translateX(0)' : 'translateX(50px)'
        }}
      >
        <List sx={{ 
          flexGrow: 1, 
          px: 1, 
          py: 2, 
          overflowY: 'auto', 
        }}>
          {singleItems.map((item, index) => renderSingleMenuItem(item, index))}
          {groupItems.map((item, index) => renderGroupMenuItem(item, index))}
        </List>
          
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.03s ease-out 0.1s'
        }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<ExitToApp style={{ marginLeft: '10px' }} />}
            sx={{
              fontWeight: 500,
              py: 1,
              direction: 'rtl',
              borderRadius: 2,
              transition: 'all 0.01s ease-out',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
              }
            }}
          >
            تسجيل الخروج
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
