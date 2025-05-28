import React, { useEffect, useState } from 'react'
import { styles } from '../assets/dummyadmin'
import { FiHeart, FiStar, FiTrash2 } from 'react-icons/fi'
import axios from 'axios'

const List = () => {
  
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchItems = async () => {
      try {
        const {data} = await axios.get('http://localhost:4000/api/items');
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  //Delete items

  const handleDelete = async (itemId) => {
    if(!window.confirm('Are you sure want to delete this item ?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/items/${itemId}`);
      setItems(prev => prev.filter(item => item._id !== itemId));
      console.log('Deleted item ID:', itemId)
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const renderStars = (rating) => (
    [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`text-xl ${
          i < rating ? 'text-green-400 fill-current' : 'text-green-100/30'
        }`}
      />
    ))
  );

  if (loading) {
    return (
      <div className={styles.pageWrapper.replace(/bg-gradient-to-br.*/, '').concat(' flex items-center justify-center text-green-100')}>
        Loading Menu...
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className=' max-w-7xl mx-auto'>
        <div className={styles.cardContainer}>
          <h2 className={styles.title}>
            Manage Menu Items
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}> Image</th>
                  <th className={styles.th}> Name</th>
                  <th className={styles.th}> Category</th>
                  <th className={styles.th}> Price (₹)</th>
                  <th className={styles.th}> Rating</th>
                  <th className={styles.th}> Hearts</th>
                  <th className={styles.th}> Delete</th>
                </tr>
              </thead>
              <tbody>
              {items.map(item => (
                <tr key={item._id} className={styles.tr}>
                  <td className={styles.imgCell}>
                    <img src={item.imageUrl} alt={item.name}
                    className={styles.img} />
                  </td>
                  <td className={styles.nameCell}>
                    <div className='space-y-1'>
                      <p className={styles.nameText}>{item.name}
                      </p>
                      < p className={styles.descText}>{item.description}</p>
                    </div>
                  </td>
                  <td className={styles.categoryCell}>{item.category}
                  </td>
                  <td className={styles.priceCell}>₹{item.price}</td>
                  <td className={styles.ratingCell}>
                    <div className=' flex gap-1 '>
                      {renderStars(item.rating)}

                    </div>
                  </td>

                  <td className={styles.heartsCell}>
                    <div className={styles.heartsWrapper}>
                      <FiHeart className='text-xl'/>
                      <span> {item.hearts}</span>
                    </div>
                  </td>
                  <td className=' p-4 text-center'>
                    <button onClick={() => handleDelete(item._id)}
                    className={styles.deleteBtn}>
                      <FiTrash2 className=' text-2xl' />
                    </button>
                    </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className={styles.emptyState}>
              No items Found in the menu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default List