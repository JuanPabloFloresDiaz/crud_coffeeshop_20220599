import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Modal, Dialog, Paragraph, Portal, PaperProvider } from 'react-native-paper';
import fetchData from '../../api/components';


const HomeScreen = ({ logueado, setLogueado }) => {

  const [visible, setVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [idToUpdate, setIdToUpdate] = useState(null);

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setIdToUpdate(null); // Restablecer idToUpdate a null cuando se cierra el modal
    limpiarCampos();
  };

  const showDeleteDialog = (id) => {
    setIdToDelete(id);
    setDeleteDialogVisible(true);
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false);

  const USER_API = 'services/admin/administrador.php';

  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [alias, setAlias] = useState('');
  const [clave, setClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [error, setError] = useState(null);

  const fetchDataFromApi = async () => {
    try {
      const data = await fetchData(USER_API, 'readAll');
      setResponse(data.dataset);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDataFromApi();
    }, [])
  );

  const confirmarEliminacion = () => {
    eliminarRegistros(idToDelete);
  };

  const eliminarRegistros = async (idA) => {
    try {
      const form = new FormData();
      form.append('idAdministrador', idA);
      const data = await fetchData(USER_API, 'deleteRow', form);
      if (data.status) {
        Alert.alert(data.message);
        fetchDataFromApi();
      } else {
        Alert.alert('Error ' + data.error);
      }
    } catch (error) {
      Alert.alert('No se pudo acceder a la API ' + error);
    }
    hideDeleteDialog();
  };

  const actualizarRegistros = async () => {
    try {
      const form = new FormData();
      form.append('idAdministrador', idToUpdate);
      form.append('nombreAdministrador', nombre);
      form.append('apellidoAdministrador', apellido);
      form.append('correoAdministrador', correo);
      const data = await fetchData(USER_API, 'updateRow', form);
      if (data.status) {
        console.log(data.message)
        Alert.alert(data.message);
        limpiarCampos();
        fetchDataFromApi();
        hideModal();
      } else {
        Alert.alert('Error ' + data.error);
      }
    } catch (error) {
      Alert.alert('No se pudo acceder a la API ' + error);
    }
  };

  const limpiarCampos = async () => {
    setNombre('');
    setApellido('');
    setCorreo('');
    setAlias('');
    setClave('');
    setConfirmarClave('');
  };

  const insertarRegistros = async () => {
    try {
      const form = new FormData();
      form.append('nombreAdministrador', nombre);
      form.append('apellidoAdministrador', apellido);
      form.append('correoAdministrador', correo);
      form.append('aliasAdministrador', alias);
      form.append('claveAdministrador', clave);
      form.append('confirmarClave', confirmarClave);
      const data = await fetchData(USER_API, 'createRow', form);
      if (data.status) {
        Alert.alert(data.message);
        limpiarCampos();
        fetchDataFromApi();
        hideModal();
      } else {
        Alert.alert('Error ' + data.error);
      }
    } catch (error) {
      Alert.alert('No se pudo acceder a la API ' + error);
    }
  };

  const openUpdate = async (id) => {
    const form = new FormData();
    form.append('idAdministrador', id);
    const data = await fetchData(USER_API, 'readOne', form);
    if (data.status) {
      const row = data.dataset;
      setIdToUpdate(row.id_administrador);
      setNombre(row.nombre_administrador);
      setApellido(row.apellido_administrador);
      setCorreo(row.correo_administrador);
      setAlias('');
      setClave('');
      setConfirmarClave('');
      showModal();
    } else {
      Alert.alert('Error', data.error);
    }
  };

  const handleSubmit = () => {
    if (idToUpdate) {
      actualizarRegistros();
    } else {
      insertarRegistros();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>{item.id_administrador}</Text>
      <Text style={styles.cardText}>{item.nombre_administrador}</Text>
      <Text style={styles.cardText}>{item.apellido_administrador}</Text>
      <Text style={styles.cardText}>{item.correo_administrador}</Text>
      <Text style={styles.cardText}>{item.alias_administrador}</Text>
      <TouchableOpacity style={styles.buttonActualizar} onPress={() => openUpdate(item.id_administrador)}>
        <Text style={styles.botonAgregarTexto}>Actualizar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonEliminar} onPress={() => showDeleteDialog(item.id_administrador)}>
        <Text style={styles.botonAgregarTexto}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
  
  const handleLogOut = async () => {
    const data = await fetchData(USER_API, 'logOut');
    try {
      if (data.status) {
        setLogueado(false)
      }else{
        Alert.alert('Error sesion', data.error);
      }
    } catch (error) {
      console.log(data);
      Alert.alert('Error sesion', data.error);
    }
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>¡Bienvenido a la aplicación!</Text>
        {error && (
          <Text style={styles.errorText}>Error: {error.message}</Text>
        )}
        <Portal>
          <Modal visible={visible} onDismiss={hideModal} style={styles.container}>
            <View style={styles.containerInput}>
              <View style={styles.containerRow}>
                <Text style={styles.title}>
                  {idToUpdate ? 'Actualizar Administrador' : 'Agregar Administrador'}
                </Text>
                <TouchableOpacity style={styles.buttonClose} onPress={hideModal}>
                  <Text style={styles.botonAgregarTexto}>X</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder='Nombre del administrador'
                onChangeText={setNombre}
                value={nombre}
                keyboardType='default'
                style={styles.input}
              />
              <TextInput
                placeholder='Apellido del administrador'
                onChangeText={setApellido}
                value={apellido}
                keyboardType='default'
                style={styles.input}
              />
              <TextInput
                placeholder='Correo del administrador'
                onChangeText={setCorreo}
                value={correo}
                keyboardType='email-address'
                style={styles.input}
              />
              <TextInput
                placeholder='Alias del administrador'
                onChangeText={setAlias}
                value={alias}
                keyboardType='default'
                style={styles.input}
                editable={!idToUpdate} // Deshabilitar en actualización
              />
              <TextInput
                placeholder='Clave del administrador'
                onChangeText={setClave}
                value={clave}
                secureTextEntry
                style={styles.input}
                editable={!idToUpdate} // Deshabilitar en actualización
              />
              <TextInput
                placeholder='Repetir clave del administrador'
                onChangeText={setConfirmarClave}
                value={confirmarClave}
                secureTextEntry
                style={styles.input}
                editable={!idToUpdate} // Deshabilitar en actualización
              />
              <TouchableOpacity style={styles.botonAgregar} onPress={handleSubmit}>
                <Text style={styles.botonAgregarTexto}>{idToUpdate ? 'Actualizar administrador' : 'Agregar administrador'}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirmar Eliminación</Dialog.Title>
            <Dialog.Content>
              <Paragraph>¿Estás seguro de que deseas eliminar este registro?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancelar</Button>
              <Button onPress={confirmarEliminacion}>Aceptar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Button style={styles.botonAgregar} onPress={showModal}>
          <Text style={styles.botonAgregarTexto}>Agregar registro</Text>
        </Button>
        <FlatList
          data={response}
          renderItem={renderItem}
          keyExtractor={item => item.id_administrador.toString()}
        />
        <Button mode="contained" onPress={handleLogOut} style={styles.button}>
          Cerrar Sesión
        </Button>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    margin: 20,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 8,
  },
  containerInput: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    margin: 5,
  },
  botonAgregar: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 4,
    maxHeight: 70,
    marginTop: 10,
  },
  buttonActualizar: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 8,
  },
  buttonEliminar: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  buttonClose: {
    marginStart: 15,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3, // Para Android
    shadowColor: '#000', // Para iOS
    shadowOffset: { width: 0, height: 2 }, // Para iOS
    shadowOpacity: 0.8, // Para iOS
    shadowRadius: 2, // Para iOS
  },
  cardText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  }, title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default HomeScreen;
