
const validateEntry = (object, minFields) => {

    const keys = Object.keys(object);

    const extraFields = []

    for (let key of keys) {
        // verificando si el objeto en el cuerpo trae los elementos necesarios
        if (minFields.includes(key)) {
            minFields = minFields.filter(value => value != key);
        } else
            extraFields.push(key);
    }
    

    return {minFields, extraFields}
}

module.exports = validateEntry