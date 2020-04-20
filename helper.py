
def distance_objectobject(object1, object2):
    return ((object2['x'] - object1['x'])**2 + (object2['y'] - object1['y'])**2)**0.5

def distance_objectpos(object, x, y):
    return ((object['x'] - x) ** 2 + (object['y'] - y) ** 2) ** 0.5